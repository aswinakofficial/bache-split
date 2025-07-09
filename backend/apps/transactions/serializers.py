from rest_framework import serializers
from decimal import Decimal
from .models import Transaction, Settlement
from apps.items.models import Item
from apps.houses.models import House
from apps.authentication.serializers import UserSerializer
from django.db import transaction as db_transaction


class TransactionSerializer(serializers.ModelSerializer):
    """
    Main serializer for Transaction model
    """
    buyer = UserSerializer(read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    house_name = serializers.CharField(source='house.name', read_only=True)
    unit_display = serializers.CharField(source='item.get_unit_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'house', 'item', 'buyer', 'quantity_taken', 'amount',
            'created_at', 'item_name', 'house_name', 'unit_display'
        ]
        read_only_fields = ['id', 'buyer', 'amount', 'created_at']

class TransactionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new transactions
    """

    quantity_unit = serializers.CharField(write_only=True, required=False, help_text="Unit of quantity taken, e.g., 'g', 'kg', 'ml', 'l'. If not provided, defaults to item's base unit.")

    class Meta:
        model = Transaction
        fields = ['house', 'item', 'quantity_taken', 'quantity_unit']


    def validate_quantity_taken(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


    def validate(self, attrs):
        item = attrs.get('item')
        quantity_taken = attrs.get('quantity_taken')
        house = attrs.get('house')
        quantity_unit = attrs.get('quantity_unit', None)

        # Conversion factors
        UNIT_CONVERSIONS = {
            # mass
            ('g', 'kg'): lambda x: x / 1000,
            ('kg', 'g'): lambda x: x * 1000,
            # volume
            ('ml', 'l'): lambda x: x / 1000,
            ('l', 'ml'): lambda x: x * 1000,
        }

        # Determine item's base unit
        item_unit = getattr(item, 'unit', None)
        if not item_unit:
            raise serializers.ValidationError("Item unit is not defined.")

        # If quantity_unit is provided and different from item_unit, convert
        if quantity_unit and quantity_unit != item_unit:
            key = (quantity_unit, item_unit)
            if key in UNIT_CONVERSIONS:
                try:
                    # Always use Decimal for quantity_taken
                    quantity_taken_converted = Decimal(str(UNIT_CONVERSIONS[key](float(quantity_taken))))
                except Exception:
                    raise serializers.ValidationError("Invalid quantity for conversion.")
            else:
                raise serializers.ValidationError(f"Cannot convert from {quantity_unit} to {item_unit}.")
        else:
            quantity_taken_converted = Decimal(str(quantity_taken))

        # Validate item belongs to house
        if item.house != house:
            raise serializers.ValidationError("Item does not belong to this house")

        # Validate sufficient quantity available
        if quantity_taken_converted > item.remaining_quantity:
            raise serializers.ValidationError(
                f"Insufficient quantity. Available: {item.remaining_quantity} {item.get_unit_display()}"
            )

        # Validate item is available
        if not item.is_available:
            raise serializers.ValidationError("Item is not available for purchase")

        # Validate user is member of house
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if not house.housemembership_set.filter(user=request.user, is_active=True).exists():
                raise serializers.ValidationError("You are not a member of this house")

        # Overwrite the quantity_taken in attrs to be in base unit
        attrs['quantity_taken'] = quantity_taken_converted

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        validated_data['buyer'] = request.user
        validated_data.pop('quantity_unit', None)
        with db_transaction.atomic():
            transaction = super().create(validated_data)
            # Update item remaining quantity
            item = transaction.item
            item.remaining_quantity -= transaction.quantity_taken
            if item.remaining_quantity <= 0:
                item.remaining_quantity = 0
                item.is_available = False
            item.save()

            # Settlement logic
            house = transaction.house
            debtor = transaction.buyer
            creditor = item.added_by  # Adjust this if your item model uses a different field for owner
            amount = transaction.amount

            # Only create/update settlement if debtor != creditor
            if debtor != creditor:
                settlement, created = Settlement.objects.get_or_create(
                    house=house,
                    debtor=debtor,
                    creditor=creditor,
                    is_settled=False,
                    defaults={'amount': amount}
                )
                if not created:
                    settlement.amount += amount
                    settlement.save()

        return transaction

class TransactionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for transaction lists
    """
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    seller_name = serializers.SerializerMethodField()
    unit = serializers.CharField(source='item.unit', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'buyer_name', 'seller_name', 'item_name', 'quantity_taken', 'unit',
            'amount', 'created_at'
        ]

    def get_seller_name(self, obj):
        # The seller is the user who added the item
        return obj.item.added_by.get_full_name() if obj.item and obj.item.added_by else "Unknown"

class SettlementSerializer(serializers.ModelSerializer):
    """
    Main serializer for Settlement model
    """
    debtor = UserSerializer(read_only=True)
    creditor = UserSerializer(read_only=True)
    house_name = serializers.CharField(source='house.name', read_only=True)
    days_pending = serializers.SerializerMethodField()
    
    class Meta:
        model = Settlement
        fields = [
            'id', 'house', 'debtor', 'creditor', 'amount', 'is_settled',
            'created_at', 'settled_at', 'house_name', 'days_pending'
        ]
        read_only_fields = ['id', 'created_at', 'settled_at']

    def get_days_pending(self, obj):
        if obj.is_settled:
            return 0
        from django.utils import timezone
        return (timezone.now() - obj.created_at).days

class SettlementCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating settlements
    """
    class Meta:
        model = Settlement
        fields = ['house', 'debtor', 'creditor', 'amount']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate(self, attrs):
        debtor = attrs.get('debtor')
        creditor = attrs.get('creditor')
        house = attrs.get('house')

        if debtor == creditor:
            raise serializers.ValidationError("Debtor and creditor cannot be the same person")

        # Validate both users are members of the house
        if not house.housemembership_set.filter(user=debtor, is_active=True).exists():
            raise serializers.ValidationError("Debtor is not a member of this house")
        
        if not house.housemembership_set.filter(user=creditor, is_active=True).exists():
            raise serializers.ValidationError("Creditor is not a member of this house")

        return attrs

class SettlementSummarySerializer(serializers.Serializer):
    """
    Serializer for settlement summary calculations
    """
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    total_owed_to_others = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_owed_by_others = serializers.DecimalField(max_digits=10, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    individual_balances = serializers.ListField()

class HouseExpenseSummarySerializer(serializers.Serializer):
    """
    Serializer for house expense summary
    """
    house_id = serializers.UUIDField()
    house_name = serializers.CharField()
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_items = serializers.IntegerField()
    total_transactions = serializers.IntegerField()
    member_expenses = serializers.ListField()
    recent_transactions = TransactionListSerializer(many=True)
