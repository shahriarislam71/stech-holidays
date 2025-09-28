from django.contrib import admin
from .models import Order, Passenger, Payment, OrderPassenger 

from django.apps import apps
models = apps.get_app_config('flights').get_models()
for model in models:
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
