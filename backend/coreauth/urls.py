# coreauth/urls.py

from django.urls import path, include
from .views import *

urlpatterns = [
    # Auth core
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),

    # Social login
    path('social/google/', GoogleLogin.as_view(), name='google_login'),

# Profile & CSRF
    path('profile/', ProfileView.as_view(), name='profile'),
    


     # Admin
    # path('auth/admin/dashboard/', AdminDashboardAccess.as_view(), name='admin_dashboard'),
]
