from django.core.management.base import BaseCommand
from holidays_visa.models import (
    HolidayPackage, HolidayPackageDetail, HolidayPackageTag,
    VisaCountry, VisaType, UmrahPackage, UmrahPackageDetail, UmrahPackageTag,
    CustomHolidayRequest, CustomUmrahRequest
)
from django.core.files import File
import os
from django.conf import settings
from datetime import date, timedelta
import random
import json
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populates the database with sample holiday, umrah, and visa data'

    def handle(self, *args, **options):
        self.stdout.write("Populating sample data...")
        
        # Clear existing data (optional - careful in production)
        self.clear_existing_data()
        
        # Create Visa Countries with Visa Types
        self.create_visa_data()
        
        # Create Holiday Packages
        self.create_holiday_packages()
        
        # Create Umrah Packages
        self.create_umrah_packages()
        
        # Create sample custom requests
        self.create_custom_requests()
        
        self.stdout.write(self.style.SUCCESS("Successfully populated sample data!"))

    def clear_existing_data(self):
        """Clear existing data in reverse order to avoid foreign key constraints"""
        CustomUmrahRequest.objects.all().delete()
        CustomHolidayRequest.objects.all().delete()
        UmrahPackageDetail.objects.all().delete()
        UmrahPackageTag.objects.all().delete()
        UmrahPackage.objects.all().delete()
        HolidayPackageDetail.objects.all().delete()
        HolidayPackageTag.objects.all().delete()
        HolidayPackage.objects.all().delete()
        VisaType.objects.all().delete()
        VisaCountry.objects.all().delete()

    def create_visa_data(self):
        """Create VisaCountry and VisaType objects"""
        visa_countries_data = [
            {
                "name": "Thailand",
                "is_featured": True,
                "visa_types": [
                    {
                        "type": "Tourist Visa",
                        "description": "Standard tourist visa for Thailand",
                        "processing_time": "3-5 business days",
                        "validity": "3 months",
                        "entry_type": "multiple",
                        "visa_fee": Decimal("5150.00"),
                        "service_fee": Decimal("1000.00"),
                        "requirements": ["Passport valid for 6 months", "2 passport photos", "Proof of onward travel", "Hotel bookings"],
                        "policies": ["Visa fee is non-refundable", "Processing time may vary"],
                        "is_popular": True
                    },
                    {
                        "type": "Express Tourist Visa",
                        "description": "Fast track tourist visa processing",
                        "processing_time": "1-2 business days",
                        "validity": "3 months",
                        "entry_type": "multiple",
                        "visa_fee": Decimal("6500.00"),
                        "service_fee": Decimal("1500.00"),
                        "requirements": ["Passport valid for 6 months", "2 passport photos", "Proof of onward travel"],
                        "policies": ["Express service fee additional", "Emergency processing available"],
                        "is_popular": False
                    }
                ]
            },
            {
                "name": "Japan",
                "is_featured": True,
                "visa_types": [
                    {
                        "type": "Tourist Visa",
                        "description": "Standard tourist visa for Japan",
                        "processing_time": "5-7 business days",
                        "validity": "90 days",
                        "entry_type": "single",
                        "visa_fee": Decimal("7200.00"),
                        "service_fee": Decimal("1200.00"),
                        "requirements": ["Passport valid for 6 months", "Completed application form", "Recent photo", "Travel itinerary"],
                        "policies": ["Appointment required", "Interview may be required"],
                        "is_popular": True
                    }
                ]
            },
            {
                "name": "United States",
                "is_featured": False,
                "visa_types": [
                    {
                        "type": "B1/B2 Tourist Visa",
                        "description": "Tourist and business visa for USA",
                        "processing_time": "10-15 business days",
                        "validity": "10 years",
                        "entry_type": "multiple",
                        "visa_fee": Decimal("18500.00"),
                        "service_fee": Decimal("2500.00"),
                        "requirements": ["DS-160 form", "Passport valid for 6 months", "Photo", "Interview appointment"],
                        "policies": ["Interview mandatory", "Document verification required"],
                        "is_popular": True
                    }
                ]
            },
            # Add more countries as needed...
        ]

        for country_data in visa_countries_data:
            country = VisaCountry.objects.create(
                name=country_data["name"],
                is_featured=country_data["is_featured"]
            )
            
            for visa_type_data in country_data["visa_types"]:
                VisaType.objects.create(
                    country=country,
                    **{k: v for k, v in visa_type_data.items() if k != 'requirements' and k != 'policies'}
                )
            
            self.stdout.write(f"Created VisaCountry: {country.name} with visa types")

    def create_holiday_packages(self):
        """Create HolidayPackage objects with details and tags"""
        holiday_packages = [
            {
                "title": "Blissful Bangkok",
                "destination": "Bangkok, Thailand",
                "description": "Amazing 3-day tour of Bangkok's temples, markets and vibrant nightlife",
                "duration": "3-5",
                "nights": 2,
                "days": 3,
                "max_people": "2-20",
                "price": Decimal("10340.00"),
                "discount_price": Decimal("8999.00"),
                "availability_start": date.today() + timedelta(days=10),
                "availability_end": date.today() + timedelta(days=180),
                "includes_flight": False,
                "details": [
                    {
                        "day": 1,
                        "title": "Arrival & City Tour",
                        "description": "Arrival at Bangkok Airport, transfer to hotel. Afternoon visit to the magnificent Grand Palace and Wat Pho (Reclining Buddha). Evening explore the famous Khao San Road.",
                        "order": 1
                    },
                    {
                        "day": 2,
                        "title": "Floating Markets & Temples",
                        "description": "Morning visit to Damnoen Saduak Floating Market. Afternoon tour of Wat Arun (Temple of Dawn) and Wat Traimit (Golden Buddha). Evening at leisure or optional dinner cruise.",
                        "order": 2
                    },
                    {
                        "day": 3,
                        "title": "Shopping & Departure",
                        "description": "Morning shopping at Chatuchak Weekend Market or MBK Center. Afternoon transfer to airport for departure.",
                        "order": 3
                    }
                ]
            },
            {
                "title": "Tokyo Explorer",
                "destination": "Tokyo, Japan",
                "description": "5-day adventure through Tokyo's futuristic districts and traditional temples",
                "duration": "5-7",
                "nights": 4,
                "days": 5,
                "max_people": "4-15",
                "price": Decimal("28500.00"),
                "discount_price": Decimal("24999.00"),
                "availability_start": date.today() + timedelta(days=15),
                "availability_end": date.today() + timedelta(days=210),
                "includes_flight": True,
                "details": [
                    {
                        "day": 1,
                        "title": "Arrival in Tokyo",
                        "description": "Arrival at Narita/Haneda Airport, transfer to hotel. Evening free to explore Shinjuku district.",
                        "order": 1
                    },
                    {
                        "day": 2,
                        "title": "Historic Tokyo",
                        "description": "Visit Meiji Shrine, Takeshita Street in Harajuku, and Shibuya Crossing. Afternoon at Asakusa (Senso-ji Temple) and Tokyo Skytree.",
                        "order": 2
                    }
                ]
            },
            # Add more packages...
        ]

        common_tags = [
            "Adventure", "Luxury", "Family", "Honeymoon", "Budget", 
            "Cultural", "Beach", "City Break", "Nature", "Shopping"
        ]

        for package_data in holiday_packages:
            # Remove details from package data
            details = package_data.pop("details", [])
            
            # Create the package
            package = HolidayPackage.objects.create(**package_data)
            
            # Add details
            for detail_data in details:
                HolidayPackageDetail.objects.create(package=package, **detail_data)
            
            # Add 3-5 random tags
            selected_tags = random.sample(common_tags, k=random.randint(3, 5))
            for tag_name in selected_tags:
                HolidayPackageTag.objects.create(package=package, name=tag_name)

            self.stdout.write(f"Created HolidayPackage: {package.title}")

    def create_umrah_packages(self):
        """Create UmrahPackage objects"""
        umrah_packages = [
            {
                "title": "Standard Umrah Package",
                "description": "Basic Umrah package with essential services",
                "nights": 7,
                "days": 8,
                "max_people": 4,
                "price": Decimal("45000.00"),
                "discount_price": Decimal("39999.00"),
                "availability_start": date.today() + timedelta(days=20),
                "availability_end": date.today() + timedelta(days=365),
                "includes_flight": True,
                "includes_hotel": True,
                "includes_transport": True,
                "includes_visa": True,
                "details": [
                    {
                        "day": 1,
                        "title": "Arrival in Jeddah",
                        "description": "Arrival at Jeddah airport, transfer to hotel in Makkah.",
                        "order": 1
                    },
                    {
                        "day": 2,
                        "title": "Performing Umrah",
                        "description": "Perform Umrah rituals with guidance from our experienced guides.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "Premium Umrah Package",
                "description": "Premium Umrah experience with luxury accommodation",
                "nights": 10,
                "days": 11,
                "max_people": 2,
                "price": Decimal("75000.00"),
                "discount_price": Decimal("69999.00"),
                "availability_start": date.today() + timedelta(days=15),
                "availability_end": date.today() + timedelta(days=300),
                "includes_flight": True,
                "includes_hotel": True,
                "includes_transport": True,
                "includes_visa": True,
                "details": [
                    {
                        "day": 1,
                        "title": "VIP Arrival",
                        "description": "VIP reception at Jeddah airport, luxury transfer to 5-star hotel in Makkah.",
                        "order": 1
                    }
                ]
            },
        ]

        umrah_tags = [
            "Standard", "Premium", "Deluxe", "Family", "Group", 
            "Ramadan", "Off-season", "Luxury", "Budget"
        ]

        for package_data in umrah_packages:
            details = package_data.pop("details", [])
            
            package = UmrahPackage.objects.create(**package_data)
            
            for detail_data in details:
                UmrahPackageDetail.objects.create(package=package, **detail_data)
            
            # Add tags
            selected_tags = random.sample(umrah_tags, k=random.randint(2, 4))
            for tag_name in selected_tags:
                UmrahPackageTag.objects.create(package=package, name=tag_name)

            self.stdout.write(f"Created UmrahPackage: {package.title}")

    def create_custom_requests(self):
        """Create sample custom requests"""
        # Create Custom Holiday Requests
        holiday_destinations = ["Maldives", "Switzerland", "Bali", "Paris", "London"]
        
        for i in range(3):
            CustomHolidayRequest.objects.create(
                contact_name=f"Customer {i+1}",
                email=f"customer{i+1}@example.com",
                phone=f"+91 98765{10000 + i}",
                destination=random.choice(holiday_destinations),
                departure_place="Delhi",
                travel_date=date.today() + timedelta(days=random.randint(30, 90)),
                number_of_travelers=random.randint(2, 6),
                budget=Decimal(str(random.randint(50000, 200000))),
                requirements=f"Looking for a {random.choice(['family', 'honeymoon', 'adventure'])} package with {random.choice(['beach', 'mountain', 'city'])} focus."
            )
        
        # Create Custom Umrah Requests
        for i in range(2):
            CustomUmrahRequest.objects.create(
                contact_name=f"Pilgrim {i+1}",
                email=f"pilgrim{i+1}@example.com",
                phone=f"+91 98765{20000 + i}",
                package_type=random.choice(['standard', 'premium', 'family']),
                departure_date=date.today() + timedelta(days=random.randint(15, 60)),
                duration=str(random.choice([7, 10, 14])),
                number_of_pilgrims=random.randint(2, 8),
                accommodation_type=random.choice(['3-star', '4-star', '5-star']),
                special_requirements=f"Need {random.choice(['wheelchair assistance', 'halal food', 'female guide', 'medical assistance'])}"
            )
        
        self.stdout.write("Created sample custom requests")