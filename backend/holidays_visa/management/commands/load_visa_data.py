import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.core.files import File
from holidays_visa.models import VisaCountry, VisaType
from datetime import datetime, timedelta
import json

class Command(BaseCommand):
    help = 'Load sample visa countries and visa types data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to load visa data...'))
        
        # Sample visa countries data
        visa_countries = [
            {
                'name': 'Australia',
                'description': 'Australia is a popular destination for tourism and work.',
                'requirements': 'Valid passport, proof of funds, travel itinerary',
                'processing_time': '10-15 business days',
                'validity': '1 year',
                'entry_type': 'Multiple',
                'fee': 150.00,
                'is_featured': True
            },
            {
                'name': 'United States',
                'description': 'US visas are required for most foreign visitors.',
                'requirements': 'DS-160 form, passport, photo, interview',
                'processing_time': '15-20 business days',
                'validity': '10 years',
                'entry_type': 'Multiple',
                'fee': 160.00,
                'is_featured': True
            },
            {
                'name': 'Canada',
                'description': 'Canada offers various visa options for visitors.',
                'requirements': 'Passport, proof of funds, purpose of visit',
                'processing_time': '12-18 business days',
                'validity': 'Up to 6 months',
                'entry_type': 'Single',
                'fee': 100.00,
                'is_featured': True
            },
            {
                'name': 'United Kingdom',
                'description': 'UK visas are required for many nationalities.',
                'requirements': 'Online application, biometrics, supporting documents',
                'processing_time': '3 weeks',
                'validity': '6 months',
                'entry_type': 'Multiple',
                'fee': 120.00,
                'is_featured': False
            },
            {
                'name': 'France',
                'description': 'France is part of the Schengen visa area.',
                'requirements': 'Schengen application, travel insurance, accommodation proof',
                'processing_time': '10-12 business days',
                'validity': '90 days',
                'entry_type': 'Multiple',
                'fee': 80.00,
                'is_featured': False
            },
            {
                'name': 'Germany',
                'description': 'Germany has strict visa requirements.',
                'requirements': 'Completed application, passport photos, financial proof',
                'processing_time': '2-3 weeks',
                'validity': '90 days',
                'entry_type': 'Multiple',
                'fee': 85.00,
                'is_featured': False
            },
            {
                'name': 'Japan',
                'description': 'Japan offers tourist and business visas.',
                'requirements': 'Passport, application form, itinerary',
                'processing_time': '5-7 business days',
                'validity': '90 days',
                'entry_type': 'Single',
                'fee': 45.00,
                'is_featured': True
            },
            {
                'name': 'Singapore',
                'description': 'Singapore has efficient visa processing.',
                'requirements': 'Passport, application form, photo',
                'processing_time': '3-5 business days',
                'validity': '30 days',
                'entry_type': 'Multiple',
                'fee': 30.00,
                'is_featured': False
            },
            {
                'name': 'Thailand',
                'description': 'Thailand offers visa on arrival for many nationalities.',
                'requirements': 'Passport, photo, return ticket',
                'processing_time': 'Visa on arrival',
                'validity': '30 days',
                'entry_type': 'Single',
                'fee': 40.00,
                'is_featured': False
            },
            {
                'name': 'New Zealand',
                'description': 'New Zealand has beautiful landscapes to explore.',
                'requirements': 'Passport, proof of funds, travel plans',
                'processing_time': '10-15 business days',
                'validity': '3 months',
                'entry_type': 'Multiple',
                'fee': 110.00,
                'is_featured': True
            }
        ]

        # Sample visa types for each country
        visa_types_data = {
            'Tourist Visa': {
                'description': 'For leisure travel and sightseeing',
                'processing_time': '7-10 business days',
                'validity': '30-90 days',
                'entry_type': 'Single/Multiple',
                'fee_range': (50, 200),
                'requirements': ['Passport valid for 6 months', 'Proof of accommodation', 'Return ticket'],
                'policies': ['No employment allowed', 'Must maintain valid health insurance']
            },
            'Business Visa': {
                'description': 'For business meetings and conferences',
                'processing_time': '10-15 business days',
                'validity': '6 months to 1 year',
                'entry_type': 'Multiple',
                'fee_range': (100, 300),
                'requirements': ['Business invitation letter', 'Company registration documents', 'Financial statements'],
                'policies': ['No local employment', 'Limited stay duration']
            },
            'Student Visa': {
                'description': 'For educational purposes',
                'processing_time': '15-30 business days',
                'validity': 'Duration of study',
                'entry_type': 'Multiple',
                'fee_range': (150, 350),
                'requirements': ['Letter of acceptance', 'Proof of funds', 'Academic records'],
                'policies': ['Must maintain enrollment', 'Limited work hours allowed']
            },
            'Work Visa': {
                'description': 'For employment purposes',
                'processing_time': '1-3 months',
                'validity': '1-5 years',
                'entry_type': 'Multiple',
                'fee_range': (200, 500),
                'requirements': ['Employment contract', 'Professional qualifications', 'Medical examination'],
                'policies': ['Tied to specific employer', 'Must report address changes']
            },
            'Transit Visa': {
                'description': 'For passing through the country',
                'processing_time': '3-5 business days',
                'validity': '72 hours',
                'entry_type': 'Single',
                'fee_range': (20, 60),
                'requirements': ['Confirmed onward ticket', 'Visa for destination country'],
                'policies': ['Must not leave airport in some cases', 'Limited stay duration']
            }
        }

        # Create visa countries and their visa types
        for country_data in visa_countries:
            # Create or update the country
            country, created = VisaCountry.objects.get_or_create(
                name=country_data['name'],
                defaults={
                    'description': country_data['description'],
                    'requirements': country_data['requirements'],
                    'processing_time': country_data['processing_time'],
                    'validity': country_data['validity'],
                    'entry_type': country_data['entry_type'],
                    'fee': country_data['fee'],
                    'is_featured': country_data['is_featured']
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created visa country: {country.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Visa country already exists: {country.name}'))

            # Create visa types for this country
            for visa_type_name, visa_type_data in visa_types_data.items():
                # Adjust some values based on country
                processing_time = visa_type_data['processing_time']
                validity = visa_type_data['validity']
                fee = visa_type_data['fee_range'][0] if country.fee < 100 else visa_type_data['fee_range'][1]

                if visa_type_name == 'Work Visa' and country.name in ['Australia', 'Canada', 'New Zealand']:
                    processing_time = '4-8 weeks'
                    validity = '2-4 years'

                VisaType.objects.get_or_create(
                    country=country,
                    type=visa_type_name,
                    defaults={
                        'description': visa_type_data['description'],
                        'processing_time': processing_time,
                        'validity': validity,
                        'entry_type': visa_type_data['entry_type'],
                        'fee': fee,
                        'requirements': json.dumps(visa_type_data['requirements']),
                        'policies': json.dumps(visa_type_data['policies'])
                    }
                )

            self.stdout.write(self.style.SUCCESS(f'Added visa types for {country.name}'))

        self.stdout.write(self.style.SUCCESS('Successfully loaded visa data!'))