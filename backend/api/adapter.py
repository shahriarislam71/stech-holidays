from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings

class CustomAccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        # Only allow social signups
        return False

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # Automatically connect social account to existing user with same email
        user = sociallogin.user
        if user.id:
            return
        
        try:
            # Check if user with this email already exists
            existing_user = self.get_user_model().objects.get(email=user.email)
            sociallogin.connect(request, existing_user)
        except self.get_user_model().DoesNotExist:
            pass