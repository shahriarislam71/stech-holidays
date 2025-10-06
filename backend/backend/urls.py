# project/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Mount all your API routes under /api/
    path('api/', include('api.urls')),
    path('api/auth/', include('coreauth.urls')),


    # Include allauth for social login redirection (frontend-to-provider flow)
    path('accounts/', include('allauth.urls')),

    # Include the holidays visa app URLs
    path('api/holidays-visa/', include('holidays_visa.urls')),
    path('api/flights/', include('flights.urls')),
    path('api/hotels/', include('hotels.urls')),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

