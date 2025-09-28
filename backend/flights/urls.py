from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import *

router = DefaultRouter()

urlpatterns = [
    # Step 1: Search flights
    path('search/', views.FlightListView.as_view(), name='flight_list'),

    # Step 2: Flight details by offer_id
    path('offers/<str:offer_id>/', views.FlightDetailsView.as_view(), name='flight_offer'),

    # Step 3: Flight fare/package details
    path('offers/<str:offer_id>/package/', views.FlightOfferView.as_view(), name='package'),

    # Step 4: Select a package/fare
    path("package/select/", views.SelectPackageView.as_view(), name="select-package"),

    # Step 5: Create order (hold/instant)
    path("orders/", views.OrderCreationView.as_view(), name="order-list-create"),
    path("orders/<str:order_id>/", views.OrderRetrievalView.as_view(), name="order-detail"),
    path("orders/<str:order_id>/services/", views.OrderServicesView.as_view(), name="order-services"),
    #path("orders/<str:order_id>/cancel/", views.CancelOrderView.as_view(), name="cancel-order"),
    
    #6. payment intents for instant orders and hold payments
    path("payment-intent/create/", views.CreatePaymentIntentView.as_view(), name="create-payment-intent"),
    path("payment-intent/confirm/", views.ConfirmPaymentIntentView.as_view(), name="confirm-payment-intent"),
    path("hold-order/pay/", views.PayHoldOrderView.as_view(), name="pay-hold-order"),
]
