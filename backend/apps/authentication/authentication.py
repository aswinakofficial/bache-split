from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class GoogleTokenAuthentication(BaseAuthentication):
    """
    Custom authentication class for Google OAuth tokens
    """
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        
        try:
            # Verify the Google token
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_OAUTH2_CLIENT_ID
            )
            
            google_id = idinfo['sub']
            user = User.objects.get(google_id=google_id)
            
            return (user, token)
            
        except (ValueError, User.DoesNotExist):
            return None
    
    def authenticate_header(self, request):
        return 'Bearer'
