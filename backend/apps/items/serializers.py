from rest_framework import serializers
from decimal import Decimal, ROUND_HALF_UP
from .models import Item
from apps.houses.models import House
from apps.authentication.serializers import UserSerializer

class ItemSerializer(serializers.ModelSerializer):
    """
    Main serializer for Item model
    """
    added_by = UserSerializer(read_only=True)
    house_name = serializers.CharField(source='house.name', read_only=True)
    unit_price_display = serializers.SerializerMethodField()
    remaining_percentage = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = [
            'id', 'house', 'name', 'total_quantity', 'remaining_quantity',
            'unit', 'total_price', 'unit_price', 'unit_price_display',
            'added_by', 'house_name', 'created_at', 'is_available',
            'remaining_percentage', 'can_edit'
        ]
        read_only_fields = ['id', 'unit_price', 'added_by', 'created_at']

    def get_unit_price_display(self, obj):
        """Format unit price for display"""
        return f"₹{obj.unit_price:.2f} per {obj.get_unit_display().lower()}"

    def get_remaining_percentage(self, obj):
        """Calculate remaining quantity percentage"""
        if obj.total_quantity > 0:
            percentage = (obj.remaining_quantity / obj.total_quantity) * 100
            return round(percentage, 1)
        return 0

    def get_can_edit(self, obj):
        """Check if user can edit this item"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.added_by == request.user or obj.house.creator == request.user
        return False

class ItemCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new items
    """
    class Meta:
        model = Item
        fields = [
            'house', 'name', 'total_quantity', 'unit', 'total_price'
        ]

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Item name must be at least 2 characters long")
        return value.strip().title()

    def validate_total_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_total_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_house(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user is member of the house
            if not value.housemembership_set.filter(user=request.user, is_active=True).exists():
                raise serializers.ValidationError("You are not a member of this house")
        return value

    def create(self, validated_data):
        validated_data['remaining_quantity'] = validated_data['total_quantity']
        validated_data['added_by'] = self.context['request'].user
        return super().create(validated_data)

class ItemUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating items
    """
    class Meta:
        model = Item
        fields = ['name', 'total_quantity', 'unit', 'total_price', 'is_available']

    def validate_total_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        
        # Check if new total quantity is less than already consumed
        instance = self.instance
        if instance:
            consumed_quantity = instance.total_quantity - instance.remaining_quantity
            if value < consumed_quantity:
                raise serializers.ValidationError(
                    f"Cannot set total quantity less than already consumed quantity ({consumed_quantity})"
                )
        return value

    def update(self, instance, validated_data):
        # Update remaining quantity proportionally if total quantity changed
        if 'total_quantity' in validated_data:
            old_total = instance.total_quantity
            new_total = validated_data['total_quantity']
            consumed = old_total - instance.remaining_quantity
            instance.remaining_quantity = new_total - consumed
            
        return super().update(instance, validated_data)

class ItemListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for item lists
    """
    added_by_name = serializers.CharField(source='added_by.get_full_name', read_only=True)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = [
            'id', 'name', 'remaining_quantity', 'unit', 'unit_price',
            'added_by_name', 'created_at', 'status'
        ]

    def get_status(self, obj):
        if not obj.is_available:
            return 'unavailable'
        elif obj.remaining_quantity <= 0:
            return 'finished'
        elif obj.remaining_quantity < (obj.total_quantity * Decimal('0.2')):
            return 'low_stock'
        return 'available'
