from django.urls import path
from .views import google_login, UserProfileView

urlpatterns = [
    path("google-login/", google_login, name="google-login"),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
]
