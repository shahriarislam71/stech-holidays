from django.core.management.base import BaseCommand
from holidays_visa.models import UmrahPackage, UmrahPackageDetail, UmrahPackageTag
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Load initial Umrah packages data'

    def handle(self, *args, **options):
        packages = [
            {
                "title": "Economy Umrah Package",
                "description": "A budget-friendly Umrah package with essential services for pilgrims.",
                "duration": "10 Days",
                "nights": 7,
                "days": 10,
                "max_people": 50,
                "price": 1500.00,
                "discount_price": 1350.00,
                "availability_start": timezone.now().date(),
                "availability_end": timezone.now().date() + timedelta(days=365),
                "includes_flight": True,
                "includes_hotel": True,
                "includes_transport": True,
                "includes_visa": True,
                "details": [
                    {
                        "day": 1,
                        "title": "Departure from Bangladesh",
                        "description": "Flight from Dhaka to Jeddah. Transfer to hotel in Makkah."
                    },
                    {
                        "day": 2,
                        "title": "Umrah Performance",
                        "description": "Perform Umrah rituals with guidance. Free time for prayers."
                    },
                    # Add more days as needed
                ],
                "tags": ["budget", "group", "economy"]
            },
            {
                "title": "Standard Umrah Package",
                "description": "A comfortable Umrah package with good quality services.",
                "duration": "12 Days",
                "nights": 9,
                "days": 12,
                "max_people": 30,
                "price": 2200.00,
                "availability_start": timezone.now().date(),
                "availability_end": timezone.now().date() + timedelta(days=365),
                "includes_flight": True,
                "includes_hotel": True,
                "includes_transport": True,
                "includes_visa": True,
                "details": [
                    {
                        "day": 1,
                        "title": "Departure",
                        "description": "Flight to Jeddah. Transfer to 4-star hotel in Makkah."
                    },
                    # Add more days as needed
                ],
                "tags": ["standard", "comfort", "mid-range"]
            },
            # Add more packages as needed
        ]

        for package_data in packages:
            tags = package_data.pop('tags', [])
            details = package_data.pop('details', [])
            
            package, created = UmrahPackage.objects.get_or_create(
                title=package_data['title'],
                defaults=package_data
            )
            
            if created:
                # Add tags
                for tag_name in tags:
                    UmrahPackageTag.objects.create(package=package, name=tag_name)
                
                # Add details
                for detail_data in details:
                    UmrahPackageDetail.objects.create(package=package, **detail_data)
                
                self.stdout.write(self.style.SUCCESS(f'Successfully created package: {package.title}'))
            else:
                self.stdout.write(self.style.WARNING(f'Package already exists: {package.title}'))

        self.stdout.write(self.style.SUCCESS('Finished loading Umrah packages'))