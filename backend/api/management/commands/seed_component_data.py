from django.core.management.base import BaseCommand

from api.models import ComponentData

# Fallback/default content for every inline-editable ("CMS") section.
# Keys map 1:1 to the `home/<name>/` API route the frontend fetches from,
# e.g. "footer" -> GET/PATCH /api/home/footer/
# These are the same values baked into each component as its client-side
# fallback, so a fresh environment renders identically whether or not the
# seeder has run yet.
COMPONENT_DEFAULTS = {
    "footer": {
        "logo": "/Stech-Holodays (1).webp",
        "tagline": "Let us be your trusted travel companion every step of the way.",
        "socialLinks": [
            {"platform": "facebook", "url": "#"},
            {"platform": "twitter", "url": "#"},
            {"platform": "instagram", "url": "#"},
            {"platform": "youtube", "url": "#"},
            {"platform": "linkedin", "url": "#"},
        ],
        "exploreLinks": [
            {"label": "Flight", "url": "/#flights"},
            {"label": "Hotel", "url": "/#hotels"},
            {"label": "Holidays", "url": "/#holidays"},
            {"label": "Visa", "url": "/#visa"},
            {"label": "Promotions", "url": "/promotions"},
        ],
        "usefulLinks": [
            {"label": "About Us", "url": "/about-us"},
            {"label": "Terms & Conditions", "url": "/terms"},
            {"label": "Privacy Policy", "url": "/privacy-policy"},
        ],
        "addressLine1": "House- 31 Rd No 17, Dhaka 1213",
        "addressLine2": "Banani, Dhaka-1213.",
        "phone": "09613-131415",
        "email": "info@stechholidays.com",
        "mapUrl": "https://www.google.com/maps/search/?api=1&query=House+31+Rd+No+17+Banani+Dhaka+1213",
        "authorizedByLabel": "Verified by",
        "authorizedByValue": "BAS15",
        "copyrightText": "© 2025 Stech Holidays. All Rights Reserved",
    },
    "hero-content": {
        "title": "Create A New Story With Every Trip",
        "subtitle": "Flight, Hotel, Holidays & Visa at your fingertips",
    },
}


class Command(BaseCommand):
    help = "Seed ComponentData rows with fallback content for inline-editable sections."

    def add_arguments(self, parser):
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Overwrite existing rows with the default content instead of skipping them.",
        )

    def handle(self, *args, **options):
        overwrite = options["overwrite"]
        for name, data in COMPONENT_DEFAULTS.items():
            component, created = ComponentData.objects.get_or_create(
                name=name, defaults={"data": data}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created '{name}'"))
            elif overwrite:
                component.data = data
                component.save()
                self.stdout.write(self.style.WARNING(f"Overwrote '{name}'"))
            else:
                self.stdout.write(f"Skipped '{name}' (already exists)")
