from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


import random
import string

def generate_booking_reference():
    return f"HTL{''.join(random.choices(string.digits, k=8))}"


class PaymentTransaction(models.Model):
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    tran_id = models.CharField(max_length=100, unique=True)
    session_key = models.CharField(max_length=100, blank=True)
    checkout_data = models.JSONField(default=dict, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    initiation_response = models.JSONField(null=True, blank=True)
    redirect_data = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    val_id = models.CharField(max_length=100, null=True, blank=True)
    ipn_data = models.JSONField(null=True, blank=True)
    redirect_received_at = models.DateTimeField(null=True, blank=True)
    ipn_received_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


# hotels/models.py - Update the HotelBooking model

class HotelBooking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
        ('canceled', 'Canceled'),
        ('completed', 'Completed'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
    ]

    # ───────────────────────
    # Booking Information
    # ───────────────────────
    booking_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    booking_reference = models.CharField(
        max_length=50,
        default=generate_booking_reference,
        db_index=True,
    )

    confirmation_number = models.CharField(
        max_length=50,
        blank=True,
        default='',
    )

    booking_confirmed_date = models.DateTimeField(
        default=timezone.now,
    )

    # ───────────────────────
    # Guest Information
    # ───────────────────────
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    guest_name = models.CharField(
        max_length=200,
        default='Guest',
    )

    guest_email = models.EmailField(
        default='guest@example.com',
    )

    guest_phone = models.CharField(
        max_length=20,
        default='N/A',
    )

    guest_country_code = models.CharField(
        max_length=10,
        default='+880',
    )

    special_requests = models.TextField(
        blank=True,
        default='',
    )

    # ───────────────────────
    # Hotel Information
    # ───────────────────────
    hotel_id = models.CharField(
        max_length=100,
        default='UNKNOWN',
    )

    hotel_name = models.CharField(
        max_length=200,
        default='Unknown Hotel',
    )

    hotel_address = models.TextField(
        default='Address not provided',
    )

    hotel_city = models.CharField(
        max_length=100,
        default='Unknown City',
    )

    hotel_country = models.CharField(
        max_length=100,
        default='Unknown Country',
    )

    # ───────────────────────
    # Room Information
    # ───────────────────────
    room_type = models.CharField(
        max_length=100,
        default='Standard',
    )

    board_type = models.CharField(
        max_length=50,
        default='Room Only',
    )

    check_in_date = models.DateField(
        default=timezone.now,
    )

    check_out_date = models.DateField(
        default=timezone.now,
    )

    nights = models.IntegerField(
        default=1,
    )

    adults = models.IntegerField(
        default=1,
    )

    children = models.IntegerField(
        default=0,
    )

    rooms = models.IntegerField(
        default=1,
    )

    # ADD THESE NEW FIELDS:
    check_in_time = models.CharField(
        max_length=50,
        default='2:00 PM',
        blank=True,
    )

    check_out_time = models.CharField(
        max_length=50,
        default='12:00 PM',
        blank=True,
    )

    key_collection = models.TextField(
        blank=True,
        default='Standard check-in at hotel reception',
    )

    # ───────────────────────
    # Pricing Information
    # ───────────────────────
    room_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
    )

    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
    )

    fee_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
    )

    total_amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
    )

    due_at_accommodation_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
    )

    # ───────────────────────
    # Payment Information
    # ───────────────────────
    currency = models.CharField(
        max_length=3,
        default='USD',
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='unpaid',
    )

    payment_method = models.CharField(
        max_length=50,
        blank=True,
        default='',
    )

    # ───────────────────────
    # Policy Information
    # ───────────────────────
    cancellation_policy = models.TextField(
        blank=True,
        default='',
    )

    refundability = models.BooleanField(
        default=False,
    )

    cancellation_timeline = models.JSONField(
        default=dict,
        blank=True,
    )

    rate_conditions = models.JSONField(
        default=list,
        blank=True,
    )

    # ───────────────────────
    # Business Information
    # ───────────────────────
    business_name = models.CharField(
        max_length=200,
        default='Your Travel Agency',
    )

    business_address = models.TextField(
        default='Your Business Address',
    )

    customer_service_phone = models.CharField(
        max_length=20,
        default='+880 1234 567890',
    )

    customer_service_email = models.EmailField(
        default='support@youragency.com',
    )

    terms_url = models.URLField(
        default='https://youragency.com/terms',
    )

    # ───────────────────────
    # Status & Metadata
    # ───────────────────────
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
    )

    transaction = models.OneToOneField(
        'PaymentTransaction',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    raw_response = models.JSONField(
        null=True,
        blank=True,
    )

    # ───────────────────────
    # Timestamps
    # ───────────────────────
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.booking_reference} - {self.hotel_name}"

    def save(self, *args, **kwargs):
        if not self.confirmation_number:
            self.confirmation_number = f"CONF-{self.booking_reference}"
        super().save(*args, **kwargs)