from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    profile_picture = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    upi_id = models.CharField(max_length=100, blank=True, null=True)