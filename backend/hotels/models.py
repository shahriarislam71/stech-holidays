from django.db import models

class HotelBooking(models.Model):
    """
    Represents a hotel booking created via Duffel API
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('canceled', 'Canceled'),
        ('failed', 'Failed')
    ]

    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('failed', 'Failed')
    ]

    booking_id = models.CharField(max_length=100, unique=True)
    quote_id = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    raw_response = models.JSONField()  # raw API response from Duffel
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.booking_id} | {self.status}"
