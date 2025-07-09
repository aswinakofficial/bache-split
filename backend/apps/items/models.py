from django.db import models
from django.contrib.auth import get_user_model
from apps.houses.models import House

User = get_user_model()

class Item(models.Model):
    UNIT_CHOICES = [
        ('nos', 'Numbers'),
        ('gram', 'Grams'),
        ('kg', 'Kilograms'),
        ('liter', 'Liters'),
        ('ml', 'Milliliters'),
    ]

    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=100)
    total_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_available = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        self.unit_price = self.total_price / self.total_quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.house.name}"