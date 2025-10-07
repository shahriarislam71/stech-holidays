from django.urls import path
from . import views

urlpatterns = [
    # Step 1: Search accommodations
    path('search/', views.AccommodationSearchView.as_view(), name='accommodation-search'),
    
    # Step 2: Get hotel offers/rooms
    path('search/<str:search_result_id>/', views.HotelOffersView.as_view(), name='hotel-offers'),
    
    # Step 3: Create quote
    path('quotes/', views.CreateQuoteView.as_view(), name='create-quote'),
    
    # Step 4: Create booking
    path('bookings/', views.CreateBookingView.as_view(), name='create-booking'),
    
    # Step 5: Confirm payment
    path('bookings/confirm-payment/', views.ConfirmBookingPaymentView.as_view(), name='confirm-booking-payment'),
    
    # Additional booking management endpoints
    path('bookings/<str:booking_id>/', views.GetBookingView.as_view(), name='get-booking'),
    path('bookings/<str:booking_id>/cancel/', views.CancelBookingView.as_view(), name='cancel-booking'),
    path('bookings/', views.ListBookingsView.as_view(), name='list-bookings'),



    
    path('payments/initiate/', views.InitiatePaymentView.as_view(), name='initiate-payment'),
    path('payments/ipn/', views.PaymentIPNView.as_view(), name='payment-ipn'),
    path('payments/success/', views.PaymentSuccessView.as_view(), name='payment-success'),
    path('payments/fail/', views.PaymentFailView.as_view(), name='payment-fail'),
    path('payments/cancel/', views.PaymentCancelView.as_view(), name='payment-cancel'),



    # Payment booking ssl commerce

]