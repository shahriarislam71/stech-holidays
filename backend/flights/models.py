from django.db import models
from django.utils import timezone

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
    


class DuffleMarkup(models.Model):
    """Model to store Duffel markup percentage"""
    percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage markup (e.g., 10.00 for 10%)")


    class Meta:
        db_table = 'duffel_markups'

    def __str__(self):
        return f"{self.percentage}% Markup"