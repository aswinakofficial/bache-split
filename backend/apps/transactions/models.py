from django.db import models
from django.contrib.auth import get_user_model
from apps.houses.models import House
from apps.items.models import Item

User = get_user_model()

class Transaction(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='transactions')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    quantity_taken = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.amount = self.quantity_taken * self.item.unit_price
        super().save(*args, **kwargs)

class Settlement(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE)
    debtor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debts')
    creditor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_settled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    settled_at = models.DateTimeField(null=True, blank=True)