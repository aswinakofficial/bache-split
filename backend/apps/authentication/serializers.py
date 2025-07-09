from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with basic user information
    """

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "profile_picture",
            "created_at",
            "updated_at",
            "upi_id",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class GoogleLoginSerializer(serializers.Serializer):
    """
    Serializer for Google OAuth login
    """

    token = serializers.CharField(required=True)

    def validate_token(self, value):
        if not value:
            raise serializers.ValidationError("Token is required")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile updates
    """

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "profile_picture", "upi_id"]

    def validate_email(self, value):
        # Only validate email uniqueness if email is being updated
        request = self.context.get("request")
        user = request.user if request else None
        if user and User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def update(self, instance, validated_data):
        # Allow partial updates (PATCH)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
