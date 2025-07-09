from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model
from django.conf import settings
from .serializers import UserProfileSerializer

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get("token")
    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), settings.GOOGLE_OAUTH2_CLIENT_ID
        )

        google_id = idinfo["sub"]
        email = idinfo["email"]
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")

        user, created = User.objects.get_or_create(
            google_id=google_id,
            defaults={
                "username": email,
                "email": email,
                "first_name": name.split(" ")[0] if name else "",
                "last_name": (
                    " ".join(name.split(" ")[1:]) if len(name.split(" ")) > 1 else ""
                ),
                "profile_picture": picture,
            },
        )
        # Optionally update user info if changed
        if not created:
            updated = False
            if user.email != email:
                user.email = email
                updated = True
            if user.profile_picture != picture:
                user.profile_picture = picture
                updated = True
            if updated:
                user.save()
        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user_id": user.id,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}".strip(),
                "picture": user.profile_picture,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        )
    except ValueError:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
