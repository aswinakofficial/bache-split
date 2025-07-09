from django.db import models
from django.contrib.auth import get_user_model
import uuid


class HouseJoinToken(models.Model):
    house = models.ForeignKey(
        "houses.House", on_delete=models.CASCADE, related_name="join_tokens"
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        get_user_model(), on_delete=models.SET_NULL, null=True, blank=True
    )

    def is_valid(self):
        from django.utils import timezone

        return not self.expires_at or self.expires_at > timezone.now()

    def __str__(self):
        return f"JoinToken({self.token}) for {self.house}"


User = get_user_model()


class House(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_houses"
    )
    members = models.ManyToManyField(
        User, through="HouseMembership", related_name="houses"
    )
    invite_code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class HouseMembership(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("house", "user")
