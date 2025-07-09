from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Transaction, Settlement
from .serializers import (
    TransactionSerializer,
    TransactionCreateSerializer,
    TransactionListSerializer,
    SettlementSerializer,
    SettlementCreateSerializer,
)

# Create your views here.


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return TransactionCreateSerializer
        elif self.action == "list":
            return TransactionListSerializer
        return TransactionSerializer

    def get_queryset(self):
        house_id = self.request.query_params.get("house")
        if house_id:
            return Transaction.objects.filter(house_id=house_id)
        return Transaction.objects.none()

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)


class SettlementViewSet(viewsets.ModelViewSet):
    queryset = Settlement.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return SettlementCreateSerializer
        return SettlementSerializer

    def get_queryset(self):
        # For detail routes, return all settlements; for list, filter by house if provided
        if self.action == "list":
            house_id = self.request.query_params.get("house")
            if house_id:
                return Settlement.objects.filter(house_id=house_id)
            return Settlement.objects.none()
        return Settlement.objects.all()
