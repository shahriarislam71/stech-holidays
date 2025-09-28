# Django and REST framework imports
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.middleware.csrf import get_token
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_framework.exceptions import AuthenticationFailed


# REST framework components
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status

# Django REST Auth and AllAuth imports
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.helpers import complete_social_login
from allauth.account.utils import perform_login

# Google authentication
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

# Other utilities
import requests
from .models import *

# View to handle user profile operations
# coreauth/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer
from django.conf import settings

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)



class GoogleIDTokenAdapter(GoogleOAuth2Adapter):
    def complete_login(self, request, app, token, **kwargs):
        id_token_str = token.token

        try:
            id_info = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID  # ✅ use secure backend config
            )
        except Exception:
            raise AuthenticationFailed("Invalid Google ID token")

        login = self.get_provider().sociallogin_from_response(request, id_info)
        login.user.email = id_info.get("email")
        login.user.first_name = id_info.get("given_name", "")
        login.user.last_name = id_info.get("family_name", "")
        login.user.username = login.user.email.split('@')[0]

        # Optionally handle picture
        picture_url = id_info.get("picture")
        if picture_url:
            request.session['google_picture_url'] = picture_url

        return login


from rest_framework.authtoken.models import Token

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.oauth2.client import OAuth2Client


# api/views.py
from rest_framework.authtoken.models import Token

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleIDTokenAdapter
    callback_url = "postmessage"
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # Get the user from the response
        user = self.user
        if user:
            # Create or get existing token
            token, created = Token.objects.get_or_create(user=user)
            # Add token to response data
            response.data['token'] = token.key
        return response