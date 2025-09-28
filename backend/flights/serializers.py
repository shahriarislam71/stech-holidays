# serializers.py
from rest_framework import serializers
from decimal import Decimal


class PaymentIntentCreateSerializer(serializers.Serializer):
    offer_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    offer_currency = serializers.CharField(max_length=3)
    customer_currency = serializers.CharField(max_length=3, required=False)
    markup = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False
    )
    
    def validate(self, attrs):
        # Use default markup if not provided
        if 'markup' not in attrs:
            from django.conf import settings
            # Convert string to Decimal
            attrs['markup'] = Decimal(settings.DUFFEL_CONFIG['DEFAULT_MARKUP'])
        
        # Ensure all amounts are Decimal
        attrs['offer_amount'] = Decimal(str(attrs['offer_amount']))
        attrs['markup'] = Decimal(str(attrs['markup']))
        
        return attrs

class PaymentIntentConfirmSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField(max_length=50)

class HoldOrderPaymentSerializer(serializers.Serializer):
    order_id = serializers.CharField(max_length=50)
    payment_type = serializers.ChoiceField(
        choices=['balance', 'card', 'arc_bsp_cash'],
        default='balance'
    )
    
    def validate(self, attrs):
        from .services import duffel_service
        try:
            order = duffel_service.get_order(attrs['order_id'])
            attrs['order_data'] = order
            
            # Convert string to Decimal
            attrs['amount'] = Decimal(order['data']['total_amount'])
            attrs['currency'] = order['data']['total_currency']
        except Exception as e:
            raise serializers.ValidationError(f"Error fetching order: {str(e)}")
        
        return attrs
#end