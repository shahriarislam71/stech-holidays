# api/urls.py

from django.urls import path, include
from .views import *

urlpatterns = [
    path('home/carousel/', CarouselView.as_view(), name='cards'),
    path('home/airlines/', AirlinesView.as_view(), name='cards'),
    path('home/app/', AppView.as_view(), name='cards'),
    path('home/flight-tracker/', FLightView.as_view(), name='cards'),

    # Generic inline-editable ("CMS") sections — matched after the fixed
    # routes above. e.g. home/footer/, home/medical-tourism-ips/
    path('home/<slug:name>/', ComponentDataView.as_view(), name='home-component'),

    path('images/', UploadedImageViewSet.as_view(), name='image-list-create'),
      path('images/<int:pk>/', RetrieveImage.as_view(), name='image-retrive'),

    path('medical-tourism/inquiry/', MedicalTourismInquiryView.as_view(), name='medical-tourism-inquiry'),

]
