# hotels/serializers.py - Add these
from rest_framework import serializers
from .models import HotelBooking
from datetime import datetime

class HotelBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelBooking
        fields = '__all__'
        read_only_fields = [
            'booking_reference',
            'confirmation_number',
            'booking_confirmed_date',
            'created_at',
            'updated_at',
            'payment_status',
            'status'
        ]
    
    def validate(self, data):
        # Validate dates
        if data.get('check_in_date') and data.get('check_out_date'):
            if data['check_in_date'] >= data['check_out_date']:
                raise serializers.ValidationError("Check-out date must be after check-in date")
            
            if data['check_in_date'] < datetime.now().date():
                raise serializers.ValidationError("Check-in date cannot be in the past")
        
        return data

class BookingConfirmationEmailSerializer(serializers.Serializer):
    reference_number = serializers.CharField()
    confirmed_date = serializers.CharField()
    hotel_name = serializers.CharField()
    hotel_address = serializers.CharField()
    check_in_date = serializers.CharField()
    check_out_date = serializers.CharField()
    check_in_time = serializers.CharField()
    check_out_time = serializers.CharField()
    guests_count = serializers.IntegerField()
    rooms_count = serializers.IntegerField()
    total_paid = serializers.CharField()
    tax_amount = serializers.CharField()
    fee_amount = serializers.CharField()
    due_at_accommodation = serializers.CharField()
    cancellation_policy = serializers.CharField()
    refundable = serializers.BooleanField()
    customer_name = serializers.CharField()
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField()

class CancellationPolicySerializer(serializers.Serializer):
    quote_id = serializers.CharField()
    cancellation_timeline = serializers.ListField()
    refundable = serializers.BooleanField()
    policy = serializers.CharField()