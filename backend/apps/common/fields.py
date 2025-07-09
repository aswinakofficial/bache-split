from rest_framework import serializers
from decimal import Decimal

class CustomDecimalField(serializers.DecimalField):
    def to_representation(self, value):
        if value is None:
            return None
        return float(Decimal(str(value)).quantize(Decimal('0.01')))

class CurrencyField(serializers.DecimalField):
    def __init__(self, **kwargs):
        kwargs.setdefault('max_digits', 10)
        kwargs.setdefault('decimal_places', 2)
        super().__init__(**kwargs)

    def to_representation(self, value):
        if value is None:
            return None
        formatted_value = float(Decimal(str(value)).quantize(Decimal('0.01')))
        return f"₹{formatted_value:.2f}"