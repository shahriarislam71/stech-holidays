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
     path('Allbookings/', views.ListBookingsView.as_view(), name='list-bookings'),


    
    path('payments/initiate/', views.InitiatePaymentView.as_view(), name='initiate-payment'),
    path('payments/ipn/', views.PaymentIPNView.as_view(), name='payment-ipn'),
    path('payments/success/', views.PaymentSuccessView.as_view(), name='payment-success'),
    path('payments/fail/', views.PaymentFailView.as_view(), name='payment-fail'),
    path('payments/cancel/', views.PaymentCancelView.as_view(), name='payment-cancel'),





 # Dashboard URLs
    path('analytics/', views.HotelAnalyticsView.as_view(), name='hotel-analytics'),
    path('markup/', views.HotelMarkupView.as_view(), name='hotel-markup'),
    path('voucher/<str:booking_id>/pdf/', views.HotelVoucherPDFView.as_view(), name='hotel-voucher-pdf'),
    path('voucher/<str:booking_id>/email/', views.SendHotelVoucherEmailView.as_view(), name='send-hotel-voucher-email'),
    
    # Booking management (mostly redirects to Duffel)
    path('bookings/', views.ListBookingsView.as_view(), name='list-bookings'),
    path('bookings/<str:booking_id>/', views.GetBookingView.as_view(), name='get-booking'),
    path('bookings/<str:booking_id>/cancel/', views.CancelBookingView.as_view(), name='cancel-booking'),
    
    # Payment URLs
    path('payments/initiate/', views.InitiatePaymentView.as_view(), name='initiate-payment'),
    path('payments/success/', views.PaymentSuccessView.as_view(), name='payment-success'),


path('cancellation-policy/<str:quote_id>/', views.GetCancellationPolicyView.as_view(), name='cancellation-policy'),
    path('bookings/complete/', views.CreateCompleteBookingView.as_view(), name='create-complete-booking'),
path('bookings/send-confirmation-email/', views.SendHotelConfirmationEmailView.as_view(), name='send-hotel-confirmation-email'),
    path('bookings/details/<str:booking_reference>/', views.GetBookingDetailsView.as_view(), name='get-booking-details'),

        path('bookings/send-confirmation-email/', views.SendHotelConfirmationEmailView.as_view(), name='send-hotel-confirmation-email'),

]