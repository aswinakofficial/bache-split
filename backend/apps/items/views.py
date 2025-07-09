from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Item
from .serializers import ItemSerializer, ItemCreateSerializer, ItemUpdateSerializer, ItemListSerializer

# Create your views here.

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ItemCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ItemUpdateSerializer
        elif self.action == 'list':
            return ItemListSerializer
        return ItemSerializer

    def get_queryset(self):
        house_id = self.request.query_params.get('house')
        if house_id:
            return Item.objects.filter(house_id=house_id, is_available=True)
        return Item.objects.none()

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)
