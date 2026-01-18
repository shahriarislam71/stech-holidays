# flights/utils/markup_utils.py
from decimal import Decimal
from django.conf import settings
from .models import GlobalMarkup

class MarkupManager:
    """Global markup manager for all products"""
    
    @staticmethod
    def get_markup(markup_type='default'):
        """Get markup percentage for a specific product type"""
        try:
            markup = GlobalMarkup.objects.get(
                markup_type=markup_type,
                is_active=True
            )
            return Decimal(str(markup.percentage))
        except GlobalMarkup.DoesNotExist:
            # Return default markups
            defaults = {
                'flight': Decimal('8.00'),
                'hotel': Decimal('10.00'),
                'default': Decimal('5.00')
            }
            return defaults.get(markup_type, Decimal('5.00'))
    
    @staticmethod
    def calculate_final_price(base_price, markup_type='default'):
        """Calculate final price with markup"""
        markup_percentage = MarkupManager.get_markup(markup_type)
        return base_price * (1 + markup_percentage / 100)
    
    @staticmethod
    def update_markup(markup_type, percentage, user=None):
        """Update markup percentage"""
        markup, created = GlobalMarkup.objects.update_or_create(
            markup_type=markup_type,
            defaults={
                'percentage': Decimal(str(percentage)),
                'updated_by': user,
                'is_active': True
            }
        )
        return markup