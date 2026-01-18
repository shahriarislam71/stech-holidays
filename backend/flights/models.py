from django.db import models
from django.utils import timezone
from django.conf import settings



class Passenger(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)  # Duffel passenger ID
    user_id = models.CharField(max_length=50, null=True, blank=True)
    title = models.CharField(max_length=10)
    given_name = models.CharField(max_length=100)
    family_name = models.CharField(max_length=100)
    born_on = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    identity_documents = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'passengers'

    def __str__(self):
        return f"{self.given_name} {self.family_name} ({self.id})"

class Order(models.Model):
    ORDER_TYPES = [
        ('instant', 'Instant'),
        ('hold', 'Hold'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)  # Duffel order ID
    user = models.ForeignKey(  # ADD THIS FIELD
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='flight_orders',
        null=True, blank=True
    )
    type = models.CharField(max_length=10, choices=ORDER_TYPES)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_currency = models.CharField(max_length=3, null=True, blank=True)
    booking_reference = models.CharField(max_length=50, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    duffel_data = models.JSONField(default=dict, blank=True)  # Store full Duffel response
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    passengers = models.ManyToManyField(Passenger, through='OrderPassenger', related_name='orders')

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} ({self.type})"

class OrderPassenger(models.Model):
    """Intermediate model for Order-Passenger relationship"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    passenger = models.ForeignKey(Passenger, on_delete=models.CASCADE)
    passenger_type = models.CharField(max_length=20, default='adult')  # adult, child, infant
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_passengers'
        unique_together = ['order', 'passenger']

class Payment(models.Model):
    PAYMENT_TYPES = [
        ('balance', 'Balance'),
        ('card', 'Card'),
        ('arc_bsp_cash', 'ARC/BSP Cash'),
    ]
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)  # Duffel payment ID
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='completed')
    duffel_data = models.JSONField(default=dict, blank=True)  # Store full payment data
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.amount} {self.currency}"
    
# flights/models.py - Enhanced DuffleMarkup model
class GlobalMarkup(models.Model):
    """Global markup settings for different product types"""
    MARKUP_TYPES = [
        ('flight', 'Flight Markup'),
        ('hotel', 'Hotel Markup'),
        ('default', 'Default Markup'),
    ]
    
    markup_type = models.CharField(max_length=20, choices=MARKUP_TYPES, unique=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    class Meta:
        db_table = 'global_markups'
        verbose_name = 'Global Markup'
        verbose_name_plural = 'Global Markups'
    
    def __str__(self):
        return f"{self.get_markup_type_display()}: {self.percentage}%"


# flights/models.py (or payments/models.py)
from django.db import models
from django.utils import timezone

class FlightPaymentTransaction(models.Model):
    # Replace the existing STATUS_CHOICES with these:
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('ssl_success', 'SSL Payment Success'),
        ('payment_success_offer_expired', 'Payment Success - Offer Expired'),
        ('payment_success_order_failed', 'Payment Success - Order Failed'),
        ('complete_success', 'Complete Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    tran_id = models.CharField(max_length=100, unique=True)
    order_id = models.CharField(max_length=100, null=True, blank=True)   # Duffel order id (if created)
    duffel_offer_id = models.CharField(max_length=100, null=True, blank=True)  # ADD THIS FIELD - which offer was used
    checkout_data = models.JSONField(default=dict, blank=True)           # original payload (passengers, order_payload, etc.)
    initiation_response = models.JSONField(null=True, blank=True)
    ipn_data = models.JSONField(null=True, blank=True)
    redirect_data = models.JSONField(null=True, blank=True)  # ADD THIS FIELD - store SSL redirect data
    redirect_received_at = models.DateTimeField(null=True, blank=True)  # ADD THIS FIELD
    val_id = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=6, default='BDT')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='initiated')  # Increased max_length to 30
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tran_id} | {self.status}"
