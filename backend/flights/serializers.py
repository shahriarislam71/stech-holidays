# serializers.py
from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone


class PaymentIntentCreateSerializer(serializers.Serializer):
    offer_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    offer_currency = serializers.CharField(max_length=3, default='GBP')
    customer_currency = serializers.CharField(max_length=3, required=False, default='BDT')
    markup = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False,
        default=Decimal('0.00')
    )
    
    def validate(self, attrs):
        # Ensure all amounts are Decimal
        attrs['offer_amount'] = Decimal(str(attrs['offer_amount']))
        attrs['markup'] = Decimal(str(attrs.get('markup', '0.00')))
        
        return attrs


class PaymentIntentConfirmSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField(max_length=50)
    order_id = serializers.CharField(max_length=50, required=False)


class HoldOrderPaymentSerializer(serializers.Serializer):
    order_id = serializers.CharField(max_length=50)
    payment_type = serializers.ChoiceField(
        choices=['balance', 'card', 'arc_bsp_cash'],
        default='balance'
    )
    
    def validate(self, attrs):
        from .services.duffel_payment_service import duffel_service
        try:
            order = duffel_service.get_order(attrs['order_id'])
            attrs['order_data'] = order
            
            # Convert string to Decimal
            attrs['amount'] = Decimal(order['data']['total_amount'])
            attrs['currency'] = order['data']['total_currency']
        except Exception as e:
            raise serializers.ValidationError(f"Error fetching order: {str(e)}")
        
        return attrs


class FlightBookingSerializer(serializers.Serializer):
    """Serializer for flight booking data"""
    order_id = serializers.CharField()
    airline = serializers.CharField()
    flight_number = serializers.CharField()
    departure = serializers.CharField()
    arrival = serializers.CharField()
    departure_time = serializers.DateTimeField()
    arrival_time = serializers.DateTimeField()
    duration = serializers.CharField()
    status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    passengers = serializers.ListField(child=serializers.DictField())
    booking_reference = serializers.CharField()
    created_at = serializers.DateTimeField()