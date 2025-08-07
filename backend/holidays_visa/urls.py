# holidays_visa/urls.py
from django.urls import path
from .views import *

urlpatterns = [
    # Holiday Packages
    path('holiday-packages/', HolidayPackageList.as_view(), name='holiday-package-list'),
    path('holiday-packages/<int:pk>-<slug:slug>/', HolidayPackageDetailView.as_view(), name='holiday-package-detail'),    
    path('holiday-destinations/', holiday_destination_list, name='holiday-destination-list'),


    # Holiday Bookings
    path('holiday-bookings/', HolidayBookingsListCreateView.as_view(), name='holiday-booking-create'),
    path('user/holiday-bookings/', UserHolidayBookings.as_view(), name='user-holiday-bookings'),
    path('holiday-bookings/<int:pk>/cancel/', HolidayBookingCancelView.as_view(), name='holiday-booking-cancel'),


    # Visa Countries
    path('visa-countries/', VisaCountryList.as_view(), name='visa-country-list'),
    path('visa-countries/<int:pk>/', VisaCountryDetail.as_view(), name='visa-country-detail'),

      # Visa Types
    path('visa-types/', VisaTypeList.as_view(), name='visa-type-list'),
    path('visa-types/<int:pk>/', VisaTypeDetail.as_view(), name='visa-type-detail'),
    

    path('visa-destinations/', visa_country_list, name='visa-country-list'),
    
    path('visa-countries/<slug:slug>/visa-types/', visa_country_visa_types, name='visa-country-types'),

    # Visa Applications
    path('visa-applications/', VisaApplicationListCreate.as_view(), name='visa-application-create'),
    path('visa-applications/<int:pk>/', VisaApplicationDetail.as_view(), name='visa-application-detail'),
    path('visa-countries/<slug:slug>/', VisaCountryBySlug.as_view(), name='visa-country-by-slug'),

    path('user/visa-applications/', UserVisaApplications.as_view(), name='user-visa-applications'),

    path('track-visa/<str:reference_number>/', VisaApplicationStatus.as_view(), name='track-visa'),

    # Umrah Urls

        # Umrah Packages
    path('umrah-packages/', UmrahPackageList.as_view(), name='umrah-package-list'),
    path('umrah-packages/<int:pk>/', UmrahPackageDetailView.as_view(), name='umrah-package-detail'),
    path('umrah-packages-list/', umrah_package_list, name='umrah-package-simple-list'),
    
    # Umrah Bookings
    path('umrah-bookings/', UmrahBookingsListCreateView.as_view(), name='umrah-booking-create'),
        path('umrah-bookings/<int:pk>/', UmrahBookingDetailView.as_view(), name='umrah-booking-detail'),

    path('user/umrah-bookings/', UserUmrahBookings.as_view(), name='user-umrah-bookings'),
    path('umrah-bookings/<int:pk>/cancel/', UmrahBookingCancelView.as_view(), name='umrah-booking-cancel'),






]