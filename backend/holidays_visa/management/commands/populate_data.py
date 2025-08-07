from django.core.management.base import BaseCommand
from holidays_visa.models import (
    HolidayPackage, HolidayPackageDetail, HolidayPackageTag,
    VisaCountry
)
from django.core.files import File
import os
from django.conf import settings
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Populates the database with sample holiday and visa data'

    def handle(self, *args, **options):
        self.stdout.write("Populating sample data...")
        
        # Clear existing data (optional)
        VisaCountry.objects.all().delete()
        HolidayPackage.objects.all().delete()
        
        # Create Visa Countries
        visa_countries = [
            {
                "name": "Thailand",
                "description": "Beautiful country with rich culture, stunning beaches, and vibrant cities",
                "requirements": "Passport valid for 6 months, 2 passport photos, proof of onward travel, hotel bookings",
                "processing_time": "3-5 business days",
                "validity": "3 months",
                "entry_type": "multiple",
                "fee": 5150.00,
                "is_featured": True
            },
            {
                "name": "Japan",
                "description": "Land of the rising sun with perfect blend of tradition and modernity",
                "requirements": "Passport valid for 6 months, completed application form, recent photo, travel itinerary",
                "processing_time": "5-7 business days",
                "validity": "90 days",
                "entry_type": "single",
                "fee": 7200.00,
                "is_featured": True
            },
            {
                "name": "United States",
                "description": "Diverse landscapes and iconic cities from coast to coast",
                "requirements": "DS-160 form, passport valid for 6 months, photo, interview appointment",
                "processing_time": "10-15 business days",
                "validity": "10 years",
                "entry_type": "multiple",
                "fee": 18500.00,
                "is_featured": False
            },
            {
                "name": "United Arab Emirates",
                "description": "Futuristic cities and desert adventures in the Middle East",
                "requirements": "Passport copy, photo, confirmed hotel booking",
                "processing_time": "3-4 business days",
                "validity": "30 days",
                "entry_type": "single",
                "fee": 8900.00,
                "is_featured": True
            },
            {
                "name": "Singapore",
                "description": "Clean, green and ultra-modern city-state",
                "requirements": "Passport valid 6 months, return ticket, hotel booking",
                "processing_time": "2-3 business days",
                "validity": "30 days",
                "entry_type": "multiple",
                "fee": 4500.00,
                "is_featured": False
            },
            {
                "name": "Australia",
                "description": "Stunning natural wonders and vibrant coastal cities",
                "requirements": "Passport, financial documents, health insurance, character documents",
                "processing_time": "15-20 business days",
                "validity": "1 year",
                "entry_type": "multiple",
                "fee": 14500.00,
                "is_featured": True
            },
            {
                "name": "United Kingdom",
                "description": "Historic landmarks and cosmopolitan cities",
                "requirements": "Passport, financial proof, accommodation details, travel itinerary",
                "processing_time": "15 working days",
                "validity": "6 months",
                "entry_type": "multiple",
                "fee": 12500.00,
                "is_featured": False
            },
            {
                "name": "Malaysia",
                "description": "Tropical paradise with diverse culture and cuisine",
                "requirements": "Passport valid 6 months, return ticket, one photo",
                "processing_time": "2-3 business days",
                "validity": "30 days",
                "entry_type": "single",
                "fee": 3800.00,
                "is_featured": False
            },
            {
                "name": "Canada",
                "description": "Vast wilderness and welcoming cities",
                "requirements": "Passport, proof of funds, travel history, purpose of visit",
                "processing_time": "14 working days",
                "validity": "Up to 10 years",
                "entry_type": "multiple",
                "fee": 9500.00,
                "is_featured": True
            },
            {
                "name": "New Zealand",
                "description": "Breathtaking landscapes and adventure activities",
                "requirements": "Passport, financial proof, return ticket, accommodation details",
                "processing_time": "20 working days",
                "validity": "3 months",
                "entry_type": "multiple",
                "fee": 11500.00,
                "is_featured": False
            }
        ]

        for country_data in visa_countries:
            VisaCountry.objects.create(**country_data)
            self.stdout.write(f"Created VisaCountry: {country_data['name']}")

        # Create Holiday Packages
        holiday_packages = [
            {
                "title": "Blissful Bangkok",
                "destination": "Bangkok, Thailand",
                "description": "Amazing 3-day tour of Bangkok's temples, markets and vibrant nightlife",
                "duration": "3-5",
                "nights": 2,
                "days": 3,
                "max_people": "2-20",
                "price": 10340.00,
                "availability_start": date.today() + timedelta(days=10),
                "availability_end": date.today() + timedelta(days=180),
                "includes_flight": False
            },
            {
                "title": "Tokyo Explorer",
                "destination": "Tokyo, Japan",
                "description": "5-day adventure through Tokyo's futuristic districts and traditional temples",
                "duration": "5-7",
                "nights": 4,
                "days": 5,
                "max_people": "4-15",
                "price": 28500.00,
                "availability_start": date.today() + timedelta(days=15),
                "availability_end": date.today() + timedelta(days=210),
                "includes_flight": True
            },
            {
                "title": "Golden Triangle USA",
                "destination": "New York, Washington DC, Philadelphia",
                "description": "8-day tour of America's historic east coast cities",
                "duration": "7-10",
                "nights": 7,
                "days": 8,
                "max_people": "6-25",
                "price": 87500.00,
                "availability_start": date.today() + timedelta(days=30),
                "availability_end": date.today() + timedelta(days=300),
                "includes_flight": True
            },
            {
                "title": "Dubai Delight",
                "destination": "Dubai, UAE",
                "description": "4-day luxury experience in Dubai with desert safari and Burj Khalifa visit",
                "duration": "4-6",
                "nights": 3,
                "days": 4,
                "max_people": "2-12",
                "price": 42500.00,
                "availability_start": date.today() + timedelta(days=20),
                "availability_end": date.today() + timedelta(days=150),
                "includes_flight": True
            },
            {
                "title": "Singapore Stopover",
                "destination": "Singapore",
                "description": "3-day city tour including Gardens by the Bay and Sentosa Island",
                "duration": "3-4",
                "nights": 2,
                "days": 3,
                "max_people": "2-15",
                "price": 24500.00,
                "availability_start": date.today() + timedelta(days=5),
                "availability_end": date.today() + timedelta(days=120),
                "includes_flight": False
            }
        ]

        common_tags = [
            "Adventure", "Luxury", "Family", "Honeymoon", "Budget", 
            "Cultural", "Beach", "City Break", "Nature", "Shopping"
        ]

        for package_data in holiday_packages:
            package = HolidayPackage.objects.create(**package_data)
            
            # Add details
            if package.title == "Blissful Bangkok":
                HolidayPackageDetail.objects.create(
                    package=package,
                    day=1,
                    title="Arrival & City Tour",
                    description="Arrival at Bangkok Airport, transfer to hotel. Afternoon visit to the magnificent Grand Palace and Wat Pho (Reclining Buddha). Evening explore the famous Khao San Road.",
                    order=1
                )
                HolidayPackageDetail.objects.create(
                    package=package,
                    day=2,
                    title="Floating Markets & Temples",
                    description="Morning visit to Damnoen Saduak Floating Market. Afternoon tour of Wat Arun (Temple of Dawn) and Wat Traimit (Golden Buddha). Evening at leisure or optional dinner cruise.",
                    order=2
                )
                HolidayPackageDetail.objects.create(
                    package=package,
                    day=3,
                    title="Shopping & Departure",
                    description="Morning shopping at Chatuchak Weekend Market or MBK Center. Afternoon transfer to airport for departure.",
                    order=3
                )
            elif package.title == "Tokyo Explorer":
                HolidayPackageDetail.objects.create(
                    package=package,
                    day=1,
                    title="Arrival in Tokyo",
                    description="Arrival at Narita/Haneda Airport, transfer to hotel. Evening free to explore Shinjuku district.",
                    order=1
                )
                HolidayPackageDetail.objects.create(
                    package=package,
                    day=2,
                    title="Historic Tokyo",
                    description="Visit Meiji Shrine, Takeshita Street in Harajuku, and Shibuya Crossing. Afternoon at Asakusa (Senso-ji Temple) and Tokyo Skytree.",
                    order=2
                )
                HolidayPackageDetail.objects.create(
                    package=package,
                    day=3,
                    title="Day Trip to Nikko",
                    description="Full-day excursion to Nikko to see Toshogu Shrine and Kegon Falls.",
                    order=3
                )
                HolidayPackageDetail.objects.create(
                    package=package,
                    day=4,
                    title="Modern Tokyo",
                    description="Explore Odaiba's futuristic attractions, teamLab Borderless digital museum, and Ginza shopping district.",
                    order=4
                )
                HolidayPackageDetail.objects.create(
                    package=package,
                    day=5,
                    title="Departure",
                    description="Free time until transfer to airport for departure.",
                    order=5
                )
            
            # Add 3-5 random tags to each package
            selected_tags = random.sample(common_tags, k=random.randint(3, 5))
            for tag_name in selected_tags:
                HolidayPackageTag.objects.create(
                    package=package,
                    name=tag_name
                )

            self.stdout.write(f"Created HolidayPackage: {package.title}")

        self.stdout.write(self.style.SUCCESS("Successfully populated sample data with 10 visa countries and 5 holiday packages"))