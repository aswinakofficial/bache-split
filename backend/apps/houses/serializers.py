from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import House, HouseMembership, HouseJoinToken
from apps.authentication.serializers import UserSerializer

User = get_user_model()


class HouseJoinTokenSerializer(serializers.ModelSerializer):
    house_name = serializers.CharField(source="house.name", read_only=True)

    class Meta:
        model = HouseJoinToken
        fields = ["token", "house", "house_name", "created_at", "expires_at"]
        read_only_fields = ["token", "created_at", "house_name"]


class HouseJoinAcceptSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    # No other fields needed; user is taken from request


class HouseMembershipSerializer(serializers.ModelSerializer):
    """
    Serializer for house membership with user details
    """

    user = UserSerializer(read_only=True)
    is_creator = serializers.SerializerMethodField()

    class Meta:
        model = HouseMembership
        fields = ["user", "joined_at", "is_active", "is_creator"]

    def get_is_creator(self, obj):
        return obj.house.creator == obj.user


class HouseSerializer(serializers.ModelSerializer):
    """
    Main serializer for House model
    """

    creator = UserSerializer(read_only=True)
    members = HouseMembershipSerializer(
        source="housemembership_set", many=True, read_only=True
    )
    member_count = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    total_transactions = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = [
            "id",
            "name",
            "description",
            "creator",
            "members",
            "member_count",
            "invite_code",
            "created_at",
            "updated_at",
            "total_items",
            "total_transactions",
            "user_role",
        ]
        read_only_fields = ["id", "creator", "invite_code", "created_at", "updated_at"]

    def get_member_count(self, obj):
        return obj.housemembership_set.filter(is_active=True).count()

    def get_total_items(self, obj):
        return obj.items.filter(is_available=True).count()

    def get_total_transactions(self, obj):
        return obj.transactions.count()

    def get_user_role(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            if obj.creator == request.user:
                return "creator"
            elif obj.housemembership_set.filter(
                user=request.user, is_active=True
            ).exists():
                return "member"
        return "non_member"


class HouseCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new houses
    """

    class Meta:
        model = House
        fields = ["name", "description"]

    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "House name must be at least 3 characters long"
            )
        return value.strip()


class HouseDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for house with additional information
    """

    creator = UserSerializer(read_only=True)
    members = HouseMembershipSerializer(
        source="housemembership_set", many=True, read_only=True
    )
    active_members = serializers.SerializerMethodField()
    recent_items = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = [
            "id",
            "name",
            "description",
            "creator",
            "members",
            "active_members",
            "invite_code",
            "created_at",
            "updated_at",
            "recent_items",
        ]

    def get_active_members(self, obj):
        active_memberships = obj.housemembership_set.filter(is_active=True)
        return HouseMembershipSerializer(active_memberships, many=True).data

    def get_recent_items(self, obj):
        from apps.items.serializers import ItemSerializer

        recent_items = obj.items.filter(is_available=True).order_by("-created_at")[:5]
        return ItemSerializer(recent_items, many=True).data


class JoinHouseSerializer(serializers.Serializer):
    """
    Serializer for joining a house via invite code
    """

    invite_code = serializers.CharField(max_length=20, required=True)

    def validate_invite_code(self, value):
        if not value or len(value.strip()) < 6:
            raise serializers.ValidationError("Invalid invite code")
        return value.strip().upper()
