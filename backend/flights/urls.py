from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import *

router = DefaultRouter()

urlpatterns = [
    
    # Search airports by query - MAIN ENDPOINT FOR FRONTEND
    path("locations/", LocationSearchView.as_view(), name="location-search"),

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
    
    # My Flights endpoints
     path("my-flights/", MyFlightsView.as_view(), name="my-flights"),
    path("my-flights/<str:order_id>/", FlightBookingDetailView.as_view(), name="flight-booking-detail"),
    path("my-flights/<str:order_id>/cancel/", CancelFlightBookingView.as_view(), name="cancel-flight-booking"),
    # Payment endpoints
      path("payment-intent/create/", views.CreatePaymentIntentView.as_view(), name="create-payment-intent"),
    path("payment-intent/confirm/", views.ConfirmPaymentIntentView.as_view(), name="confirm-payment-intent"),
    path("hold-order/pay/", views.PayHoldOrderView.as_view(), name="pay-hold-order"),
    path("payment/success/", views.PaymentSuccessView.as_view(), name="payment-success"),
    path("payment/webhook/", views.DuffelWebhookView.as_view(), name="duffel-webhook"),
    
    # Order management
    # path("orders/<str:order_id>/payment-status/", views.PaymentStatusView.as_view(), name="payment-status"),
    
    path("payments/initiate/", views.InitiateFlightPaymentView.as_view(), name="flights-initiate-payment"),
    path("payments/success/", views.FlightPaymentSuccessView.as_view(), name="flights-payment-success"),
]
