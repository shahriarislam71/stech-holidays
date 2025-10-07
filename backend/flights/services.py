# services.py
import requests
import logging
from decimal import Decimal
from django.conf import settings
from typing import Dict, Optional, Tuple
from django.utils import timezone

logger = logging.getLogger(__name__)

class DuffelPaymentService:
    """Complete Duffel payment service with all required functionality"""
    
    def __init__(self):
        self.base_url = "https://api.duffel.com"
        self.api_key = settings.DUFFEL_ACCESS_TOKEN
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Duffel-Version': 'v2',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip'
        }
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Generic request handler with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                timeout=30
            )
            
            logger.info(f"Duffel Payment API {method} {endpoint}: {response.status_code}")
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                error_data = response.json() if response.content else {}
                logger.error(f"Duffel API error {response.status_code}: {error_data}")
                response.raise_for_status()
                
        except requests.exceptions.Timeout:
            logger.error(f"Duffel API timeout for {endpoint}")
            raise Exception("Payment provider timeout - please try again")
        except requests.exceptions.RequestException as e:
            logger.error(f"Duffel API request failed for {endpoint}: {str(e)}")
            raise Exception("Payment service temporarily unavailable")
    
    def create_payment_intent(self, amount: Decimal, currency: str, metadata: Dict = None) -> Dict:
        """
        Create a PaymentIntent for instant orders
        Note: Duffel doesn't have traditional payment intents like Stripe.
        This simulates the concept for your frontend.
        """
        # For Duffel, we'll create a mock payment intent that tracks the payment state
        payment_intent_id = f"pi_{int(timezone.now().timestamp())}_{abs(hash(str(amount)))}"
        
        return {
            "data": {
                "id": payment_intent_id,
                "amount": str(amount),
                "currency": currency,
                "status": "requires_payment_method",
                "client_secret": f"cs_{payment_intent_id}_secret",
                "metadata": metadata or {}
            }
        }
    
    def confirm_payment_intent(self, payment_intent_id: str, payment_method: Dict = None) -> Dict:
        """
        Confirm a payment intent - in Duffel context, this would create the actual payment
        """
        # Extract order ID from metadata or handle based on your implementation
        try:
            # This is a simplified implementation - you'll need to adapt based on your order flow
            if payment_intent_id.startswith("pi_"):
                # Extract order ID from your tracking system
                order_id = self._get_order_id_from_payment_intent(payment_intent_id)
                if order_id:
                    return self.create_instant_order_payment(order_id, payment_method)
            
            raise Exception("Invalid payment intent")
        except Exception as e:
            logger.error(f"Error confirming payment intent: {str(e)}")
            raise
    
    def create_instant_order_payment(self, order_id: str, payment_method: Dict) -> Dict:
        """
        Create payment for instant order using Duffel's balance system
        """
        # Get order details first to verify amount
        order_data = self._make_request("GET", f"/air/orders/{order_id}")
        order = order_data.get("data", {})
        
        payment_data = {
            "data": {
                "order_id": order_id,
                "payment": {
                    "type": "balance",  # Using Duffel balance
                    "amount": order.get("total_amount"),
                    "currency": order.get("total_currency")
                }
            }
        }
        
        return self._make_request("POST", "/air/payments", payment_data)
    
    def create_hold_order_payment(self, order_id: str, amount: Decimal, 
                                currency: str, payment_type: str = 'balance') -> Dict:
        """
        Create payment for a hold order - MAIN DUFFEL PAYMENT ENDPOINT
        """
        payment_data = {
            "data": {
                "order_id": order_id,
                "payment": {
                    "type": payment_type,
                    "amount": str(amount),
                    "currency": currency
                }
            }
        }
        
        return self._make_request("POST", "/air/payments", payment_data)
    
    def get_order(self, order_id: str) -> Dict:
        """Get order details including payment status"""
        return self._make_request("GET", f"/air/orders/{order_id}")
    
    def get_payment(self, payment_id: str) -> Dict:
        """Get payment details"""
        return self._make_request("GET", f"/air/payments/{payment_id}")
    
    def _get_order_id_from_payment_intent(self, payment_intent_id: str) -> Optional[str]:
        """
        Retrieve order ID associated with a payment intent
        Implement your own tracking logic here
        """
        # This would typically query your database
        from .models import PaymentIntent
        try:
            intent = PaymentIntent.objects.get(id=payment_intent_id)
            return intent.order_id
        except:
            return None
    
    def validate_payment_requirements(self, order_id: str) -> Tuple[bool, str]:
        """
        Validate if order can be paid for
        Returns (is_valid, error_message)
        """
        try:
            order_data = self.get_order(order_id)
            order = order_data.get("data", {})
            
            # Check if order exists
            if not order:
                return False, "Order not found"
            
            # Check if already paid
            if order.get("payments") and len(order.get("payments", [])) > 0:
                return False, "Order already paid"
            
            # Check if order is cancelled
            if order.get("cancelled_at"):
                return False, "Order is cancelled"
            
            # Check payment required by date for hold orders
            payment_required_by = order.get("payment_required_by")
            if payment_required_by:
                from datetime import datetime
                required_date = datetime.fromisoformat(payment_required_by.replace('Z', '+00:00'))
                if timezone.now() > required_date:
                    return False, "Payment deadline has passed"
            
            return True, "Valid for payment"
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"

duffel_service = DuffelPaymentService()