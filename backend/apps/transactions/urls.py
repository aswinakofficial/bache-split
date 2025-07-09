from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, SettlementViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'settlements', SettlementViewSet, basename='settlement')

urlpatterns = router.urls
