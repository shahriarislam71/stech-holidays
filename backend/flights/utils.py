# your_app/utils.py
import requests
from django.conf import settings

def ssl_url(sandbox=True):
    """
    Returns SSLCommerz API endpoint based on environment.
    """
    if sandbox:
        return "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    return "https://securepay.sslcommerz.com/gwprocess/v4/api.php"


def duffel_headers():
    """
    Returns headers required for Duffel API requests.
    """
    return {
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Duffel-Version": "v2"
        }

# flights/utils/currency.py
from forex_python.converter import CurrencyRates, RatesNotAvailableError
from decimal import Decimal

def convert_to_bdt(amount, from_currency):
    """
    Convert any currency to BDT using live forex rates with fallback.
    """
    c = CurrencyRates()
    try:
        rate = c.get_rate(from_currency.upper(), 'BDT')
        print(f"🌍 Live rate {from_currency}->BDT: {rate}")
        converted = Decimal(amount) * Decimal(rate)
        return round(converted, 2)
    except RatesNotAvailableError:
        print(f"⚠️ Live rate unavailable for {from_currency}, using fallback rate.")
        fallback_rates = {"USD": 119.5, "EUR": 128.3, "GBP": 136.8}
        rate = fallback_rates.get(from_currency.upper(), 120)
        return round(Decimal(amount) * Decimal(rate), 2)
