from rest_framework import status
from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated,AllowAny
from coreauth.permissions import IsAdmin  # Import your custom permission


class HolidayPackageList(generics.ListCreateAPIView):
    serializer_class = HolidayPackageSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['destination', 'duration', 'includes_flight', 'destination_slug']
    search_fields = ['title', 'destination', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = HolidayPackage.objects.all()
        
        # Handle destination slug with commas
        destination_slug = self.request.query_params.get('destination_slug', None)
        if destination_slug:
            # Split by comma and search for any matching destination
            destinations = destination_slug.split(',')
            queryset = queryset.filter(
                Q(destination_slug__in=destinations) | 
                Q(destination_slug__contains=destination_slug.replace(',', '-'))
            ).distinct()
        
        # Rest of your filters...
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = tags.split(',')
            queryset = queryset.filter(tags__name__in=tag_list).distinct()
        
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]
    
class HolidayPackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HolidayPackage.objects.all()
    serializer_class = HolidayPackageSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdmin()]
        return [IsAuthenticated()]

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import HolidayBookingSerializer

class HolidayBookingsListCreateView(generics.ListCreateAPIView):
    queryset = HolidayBooking.objects.all()  # Add this
    serializer_class = HolidayBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking = serializer.save()  # Don't pass user explicitly anymore
        package = booking.package  # you can access it from the saved instance

        # Update user phone if needed
        if booking.phone and (
            not self.request.user.phone_number or 
            self.request.user.phone_number != booking.phone
        ):
            self.request.user.phone_number = booking.phone
            self.request.user.save()

        # Send confirmation email
        self.send_confirmation_email(booking, package)

    def send_confirmation_email(self, booking, package):
        # Implement actual email sending here
        pass

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            response.data['message'] = 'Booking created successfully'
            return response
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_serializer_context(self):
        return {'request': self.request}


class UserHolidayBookings(generics.ListAPIView):
    serializer_class = HolidayBookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HolidayBooking.objects.filter(user=self.request.user).select_related('package')


# holidays_visa/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import HolidayPackage

@api_view(['GET'])
def holiday_destination_list(request):
    """
    Returns a list of unique holiday destinations with their slugs
    """
    destinations = HolidayPackage.objects.values('destination', 'destination_slug')

    # Deduplicate using a dict based on slug
    unique_destinations = {}
    for dest in destinations:
        slug = dest['destination_slug']
        if slug not in unique_destinations:
            unique_destinations[slug] = {
                'name': dest['destination'],
                'slug': slug
            }

    return Response({
        'destinations': list(unique_destinations.values())
    })



class HolidayBookingCancelView(generics.UpdateAPIView):
    queryset = HolidayBooking.objects.all()
    serializer_class = HolidayBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        instance = self.get_object()
        
        # Only allow cancellation if status is not 'completed'
        if instance.status == 'completed':
            raise serializers.ValidationError("Cannot cancel a completed booking.")
            
        serializer.save(status='cancelled')

    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            response.data['message'] = 'Booking cancelled successfully'
            return response
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )



class VisaCountryList(generics.ListCreateAPIView):
    queryset = VisaCountry.objects.all()
    serializer_class = VisaCountrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['name', 'is_featured', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class VisaCountryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = VisaCountry.objects.all()
    serializer_class = VisaCountrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    

class VisaTypeList(generics.ListCreateAPIView):
    queryset = VisaType.objects.select_related('country')
    serializer_class = VisaTypeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['type', 'country__name']
    filterset_fields = ['country', 'entry_type']
    ordering_fields = ['type', 'fee', 'country__name']
    ordering = ['country__name', 'type']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class VisaTypeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = VisaType.objects.select_related('country')
    serializer_class = VisaTypeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    

# holidays_visa/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import HolidayPackage

@api_view(['GET'])
def visa_country_list(request):
    """
    Returns a list of unique visa countries with their slugs
    """
    countries = VisaCountry.objects.values('name', 'slug',"id")
    return Response({
        'countries': list(countries)
    })

@api_view(['GET'])
def visa_country_visa_types(request, slug):
    """
    Returns visa types for a specific country
    """
    try:
        country = VisaCountry.objects.get(slug=slug)
        visa_types = VisaType.objects.filter(country=country)
        serializer = VisaTypeSerializer(visa_types, many=True, context={'request': request})
        return Response(serializer.data)
    except VisaCountry.DoesNotExist:
        return Response(
            {"detail": "Country not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )

class VisaApplicationListCreate(generics.ListCreateAPIView):
    queryset = VisaApplication.objects.all()
    serializer_class = VisaApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserVisaApplications(generics.ListAPIView):
    serializer_class = VisaApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'departure_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return VisaApplication.objects.filter(user=self.request.user).select_related('country', 'visa_type')

class VisaApplicationDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VisaApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    
    def get_queryset(self):
        return VisaApplication.objects.filter(user=self.request.user)

class VisaApplicationStatus(generics.RetrieveAPIView):
    serializer_class = VisaApplicationSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'reference_number'
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return VisaApplication.objects.filter(user=self.request.user)
        return VisaApplication.objects.all()
    
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        if not request.user.is_authenticated or instance.user != request.user:
            return Response({
                'reference_number': instance.reference_number,
                'status': instance.status,
                'country': instance.country.name,
                'created_at': instance.created_at
            })
        return super().get(request, *args, **kwargs)
    
class VisaCountryBySlug(generics.RetrieveAPIView):
    queryset = VisaCountry.objects.all()
    serializer_class = VisaCountrySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


# Umrah

# holidays_visa/views.py

class UmrahPackageList(generics.ListCreateAPIView):
    serializer_class = UmrahPackageSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['includes_flight', 'includes_hotel', 'includes_transport', 'includes_visa']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = UmrahPackage.objects.all()
        
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

class UmrahPackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UmrahPackage.objects.all()
    serializer_class = UmrahPackageSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'  # Now using primary key
    
    # Remove slug-related logic
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdmin()]
        return [AllowAny()]

class UmrahBookingsListCreateView(generics.ListCreateAPIView):
    serializer_class = UmrahBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking = serializer.save()
        package = booking.package

        if booking.phone and (
            not self.request.user.phone_number or 
            self.request.user.phone_number != booking.phone
        ):
            self.request.user.phone_number = booking.phone
            self.request.user.save()

    def get_queryset(self):
        return UmrahBooking.objects.filter(user=self.request.user)

class UmrahBookingDetailView(generics.RetrieveUpdateAPIView):
    """
    View to retrieve and update Umrah bookings
    """
    serializer_class = UmrahBookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UmrahBooking.objects.all()



class UserUmrahBookings(generics.ListAPIView):
    serializer_class = UmrahBookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UmrahBooking.objects.filter(user=self.request.user).select_related('package')

class UmrahBookingCancelView(generics.UpdateAPIView):
    queryset = UmrahBooking.objects.all()
    serializer_class = UmrahBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status == 'completed':
            raise serializers.ValidationError("Cannot cancel a completed booking.")
        serializer.save(status='cancelled')

@api_view(['GET'])
def umrah_package_list(request):
    """
    Returns a list of Umrah packages with their slugs
    """
    packages = UmrahPackage.objects.values('title', 'slug', 'id')
    return Response({
        'packages': list(packages)
    })





# holidays_visa/views.py (add to existing views)

class CustomHolidayRequestListCreate(generics.ListCreateAPIView):
    serializer_class = CustomHolidayRequestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:  # Admin sees all
                return CustomHolidayRequest.objects.all()
            else:  # Regular users see only their own
                return CustomHolidayRequest.objects.filter(user=self.request.user)
        return CustomHolidayRequest.objects.none()
    
    def perform_create(self, serializer):
        serializer.save()

class CustomHolidayRequestDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomHolidayRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return CustomHolidayRequest.objects.all()
        return CustomHolidayRequest.objects.filter(user=self.request.user)

class CustomHolidayRequestUpdateStatus(generics.UpdateAPIView):
    """Admin only - update status and internal notes"""
    serializer_class = CustomHolidayRequestStatusSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return CustomHolidayRequest.objects.all()


# umrah/views.py


class CustomUmrahRequestListCreate(generics.ListCreateAPIView):
    serializer_class = CustomUmrahRequestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:  # Admin sees all
                return CustomUmrahRequest.objects.all()
            else:  # Regular users see only their own
                return CustomUmrahRequest.objects.filter(user=self.request.user)
        return CustomUmrahRequest.objects.none()
    
    def perform_create(self, serializer):
        serializer.save()

class CustomUmrahRequestDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomUmrahRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return CustomUmrahRequest.objects.all()
        return CustomUmrahRequest.objects.filter(user=self.request.user)

class CustomUmrahRequestUpdateStatus(generics.UpdateAPIView):
    """Admin only - update status and internal notes"""
    serializer_class = CustomUmrahRequestStatusSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return CustomUmrahRequest.objects.all()