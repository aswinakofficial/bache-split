from rest_framework.routers import DefaultRouter
from .views import HouseViewSet
from .views import HouseJoinTokenRetrieveView, HouseJoinAcceptView
from django.urls import path

router = DefaultRouter()
router.register(r"houses", HouseViewSet, basename="house")

urlpatterns = router.urls

urlpatterns += [
    path(
        "houses/join/<uuid:token>/",
        HouseJoinTokenRetrieveView.as_view(),
        name="house-join-token",
    ),
    path("houses/join/accept/", HouseJoinAcceptView.as_view(), name="house-join-accept"),
]
