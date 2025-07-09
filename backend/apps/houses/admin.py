from django.contrib import admin
from .models import HouseJoinToken


@admin.register(HouseJoinToken)
class HouseJoinTokenAdmin(admin.ModelAdmin):
    list_display = ("token", "house", "created_by", "created_at", "expires_at")
    search_fields = ("token", "house__name")
    list_filter = ("house",)


# Register your models here.
