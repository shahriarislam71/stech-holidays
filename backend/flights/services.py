import requests
import logging
from decimal import Decimal
from django.conf import settings
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class DuffelPaymentService:
    def __init__(self):
        self.base_url = settings.DUFFEL_CONFIG['BASE_URL']
        self.api_key = settings.DUFFEL_CONFIG['API_KEY']
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Duffel-Version': settings.DUFFEL_CONFIG['VERSION'],
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None):
        """Generic request handler with error handling"""
        url = f"{self.base_url}/{endpoint}"
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Duffel API error: {e}")
            raise
    
    def get_fx_rate(self, from_currency: str, to_currency: str) -> Decimal:
        """Get FX rate with markup - implement with your preferred provider"""
        # Convert float rates to Decimal for consistency
        fx_rates = {
            ('EUR', 'GBP'): Decimal('0.85'),
            ('GBP', 'EUR'): Decimal('1.176'),
            ('EUR', 'USD'): Decimal('1.05'),
            ('USD', 'EUR'): Decimal('0.95'),
        }
        
        rate = fx_rates.get((from_currency, to_currency), Decimal('1.0'))
        
        # Convert float to Decimal before multiplication
        fx_markup_rate = Decimal(str(settings.DUFFEL_CONFIG['FX_MARKUP_RATE']))
        return rate * (1 + fx_markup_rate)
    
    def calculate_customer_amount(self, offer_amount: Decimal, markup: Decimal, 
                                target_currency: str) -> Decimal:
        """Calculate final amount to charge customer"""
        # Convert from balance currency to target currency
        fx_rate = self.get_fx_rate(settings.BALANCE_CURRENCY, target_currency)
        
        # Calculate base amount with markup
        base_amount = (offer_amount + markup) * fx_rate
        
        # Apply Duffel Payments fee - convert float to Decimal
        duffel_fee_rate = Decimal(str(settings.DUFFEL_CONFIG['DUFFEL_PAYMENTS_FEE_RATE']))
        final_amount = base_amount / (1 - duffel_fee_rate)
        
        return round(final_amount, 2)
    
    def create_payment_intent(self, amount: Decimal, currency: str) -> Dict:
        """Create a PaymentIntent for instant orders"""
        # Ensure amount is properly formatted as string
        data = {
            "data": {
                "amount": str(amount.quantize(Decimal('0.01'))),  # Format to 2 decimal places
                "currency": currency
            }
        }
        return self._make_request('POST', 'payments/payment_intents', data)
    
    def confirm_payment_intent(self, payment_intent_id: str) -> Dict:
        """Confirm a PaymentIntent after successful payment collection"""
        endpoint = f"payments/payment_intents/{payment_intent_id}/actions/confirm"
        return self._make_request('POST', endpoint)
    
    def create_hold_order_payment(self, order_id: str, amount: Decimal, 
                                currency: str, payment_type: str = 'balance') -> Dict:
        """Create payment for a hold order"""
        data = {
            "data": {
                "order_id": order_id,
                "payment": {
                    "type": payment_type,
                    "amount": str(amount.quantize(Decimal('0.01'))),  # Format properly
                    "currency": currency
                }
            }
        }
        return self._make_request('POST', 'air/payments', data)
    
    def get_order(self, order_id: str) -> Dict:
        """Get latest order details before payment"""
        return self._make_request('GET', f'air/orders/{order_id}')

duffel_service = DuffelPaymentService()