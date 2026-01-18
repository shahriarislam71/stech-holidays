from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone
import random


User = get_user_model()

class HolidayPackage(models.Model):

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    destination = models.CharField(max_length=100)
    destination_slug = models.SlugField(max_length=120, editable=False, blank=True)
    description = models.TextField()
    duration = models.CharField(max_length=80)
    nights = models.PositiveIntegerField()
    days = models.PositiveIntegerField()
    max_people = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability_start = models.DateField()
    availability_end = models.DateField()
    includes_flight = models.BooleanField(default=False)
    featured_image = models.ImageField(upload_to='holiday_packages/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Always create/refresh the slug from the destination
        self.destination_slug = slugify(self.destination)
        self.slug = slugify(self.destination)

        # You already build `self.slug` from title+destination – keep that
        if not self.slug:
            self.slug = slugify(f"{self.title}-{self.destination}")
        super().save(*args, **kwargs)


class HolidayPackageDetail(models.Model):
    package = models.ForeignKey(HolidayPackage, related_name='details', on_delete=models.CASCADE)
    day = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['day', 'order']
    
    def __str__(self):
        return f"Day {self.day}: {self.title}"

class HolidayPackageTag(models.Model):
    package = models.ForeignKey(HolidayPackage, related_name='tags', on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class HolidayBooking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='holiday_bookings')
    package = models.ForeignKey(HolidayPackage, on_delete=models.CASCADE, related_name='bookings')
    contact_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    departure_date = models.DateField()
    travelers = models.PositiveIntegerField(default=1)
    custom_request = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking #{self.id} - {self.package.title}"



class VisaCountry(models.Model):
    """Simplified visa country model - just name and cover photo"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    cover_image = models.ImageField(upload_to='visa_countries/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Visa Countries"
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class VisaType(models.Model):
    """Visa type now contains all details including processing fees"""
    country = models.ForeignKey(VisaCountry, related_name='visa_types', on_delete=models.CASCADE)
    type = models.CharField(max_length=100)  # e.g., "Tourist Visa"
    description = models.TextField()
    processing_time = models.CharField(max_length=50)
    validity = models.CharField(max_length=50)
    entry_type = models.CharField(max_length=50)  # Single/Multiple
    visa_fee = models.DecimalField(max_digits=10, decimal_places=2)  # Renamed from 'fee'

    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Added service fee
    image = models.ImageField(upload_to='visa_types/', null=True, blank=True)
    requirements = models.JSONField(default=list)  
    policies = models.JSONField(default=list)
    is_popular = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.type} for {self.country.name}"
    
    @property
    def total_fee(self):
        """Calculate total fee including all charges"""
        return self.visa_fee  + self.service_fee

class VisaApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visa_applications')
    country = models.ForeignKey(VisaCountry, on_delete=models.CASCADE, related_name='applications')
    visa_type = models.ForeignKey(VisaType, on_delete=models.CASCADE, related_name='applications', null=True)
    contact_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    departure_date = models.DateField()
    travelers = models.PositiveIntegerField(default=1)
    passport_number = models.CharField(max_length=50)
    passport_expiry = models.DateField()
    additional_info = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending')
    reference_number = models.CharField(max_length=20, unique=True, blank=True)
    documents = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    visa_fee = models.DecimalField(max_digits=10, decimal_places=2)

    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Visa Application #{self.reference_number} - {self.country.name}"
    
    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self.generate_reference_number()
        super().save(*args, **kwargs)
    
    def generate_reference_number(self):
        prefix = "VISA"
        date_part = timezone.now().strftime("%y%m%d")
        random_part = str(random.randint(1000, 9999))
        return f"{prefix}{date_part}{random_part}"
    
    def calculate_fees(self):
        """Calculate all fees based on visa type and number of travelers"""
        if self.visa_type:
            self.visa_fee = self.visa_type.visa_fee * self.travelers

            self.service_fee = self.visa_type.service_fee * self.travelers
            self.total_amount = self.visa_fee  + self.service_fee
            
              


# holidays_visa/models.py

class UmrahPackage(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    nights = models.PositiveIntegerField()
    days = models.PositiveIntegerField()
    max_people = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability_start = models.DateField()
    availability_end = models.DateField()
    includes_flight = models.BooleanField(default=False)
    includes_hotel = models.BooleanField(default=True)
    includes_transport = models.BooleanField(default=True)
    includes_visa = models.BooleanField(default=True)
    featured_image = models.ImageField(upload_to='umrah_packages/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class UmrahPackageDetail(models.Model):
    package = models.ForeignKey(UmrahPackage, related_name='details', on_delete=models.CASCADE)
    day = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['day', 'order']
    
    def __str__(self):
        return f"Day {self.day}: {self.title}"

class UmrahPackageTag(models.Model):
    package = models.ForeignKey(UmrahPackage, related_name='tags', on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class UmrahBooking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='umrah_bookings')
    package = models.ForeignKey(UmrahPackage, on_delete=models.CASCADE, related_name='bookings')
    contact_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    departure_date = models.DateField()
    travelers = models.PositiveIntegerField(default=1)
    custom_request = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Umrah Booking #{self.id} - {self.package.title}"
    



 # holidays_visa/models.py (add to existing models)

class CustomHolidayRequest(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_holiday_requests', null=True, blank=True)
    contact_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Travel Details
    destination = models.CharField(max_length=100)
    departure_place = models.CharField(max_length=100)
    travel_date = models.DateField()
    number_of_travelers = models.PositiveIntegerField(default=1)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    requirements = models.TextField()
    
    # Lead Management
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    internal_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Custom Request #{self.id} - {self.destination} - {self.contact_name}"
    




    # umrah/models.py


class CustomUmrahRequest(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PACKAGE_TYPE_CHOICES = [
        ('standard', 'Standard Umrah'),
        ('premium', 'Premium Umrah'),
        ('deluxe', 'Deluxe Umrah'),
        ('family', 'Family Package'),
        ('group', 'Group Package'),
    ]
    
    ACCOMMODATION_CHOICES = [
        ('3-star', '3 Star Hotel'),
        ('4-star', '4 Star Hotel'),
        ('5-star', '5 Star Hotel'),
        ('premium', 'Premium Hotel'),
        ('walking-distance', 'Walking Distance to Haram'),
    ]
    
    # Basic Information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_umrah_requests', null=True, blank=True)
    contact_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Umrah Details
    package_type = models.CharField(max_length=20, choices=PACKAGE_TYPE_CHOICES, default='standard')
    departure_date = models.DateField()
    duration = models.CharField(max_length=10, default='7')
    number_of_pilgrims = models.PositiveIntegerField(default=1)
    accommodation_type = models.CharField(max_length=20, choices=ACCOMMODATION_CHOICES, default='3-star')
    special_requirements = models.TextField(blank=True)
    
    # Lead Management
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    internal_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Custom Umrah Request #{self.id} - {self.package_type} - {self.contact_name}"