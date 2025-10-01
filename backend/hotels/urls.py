from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import *

router = DefaultRouter()

urlpatterns = [
    # Step 1: Search flights
    path('search/', views.AccommodationSearchView.as_view(), name='flight_list'),
]
