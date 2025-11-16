
import os
import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.decorators import method_decorator
from .models import *
# Utility functions

from .models import ComponentData

from rest_framework import generics



def write_to_db(model_name, data):
    """
    Write JSON data to the database.
    """
    component, created = ComponentData.objects.get_or_create(name=model_name)
    component.data = data
    component.save()



@method_decorator(csrf_exempt, name='dispatch')
class JsonDBView(View):
    model_name = None  # Override this in subclasses

    def get(self, request):
        try:
            component = ComponentData.objects.get(name=self.model_name)
            data = component.data
            return JsonResponse(data, safe=False)
        except ComponentData.DoesNotExist:
            return JsonResponse({"error": f"{self.model_name} does not exist in the database"}, status=404)

    def patch(self, request):
        updated_data = json.loads(request.body)
        try:
            component = ComponentData.objects.get(name=self.model_name)
            existing_data = component.data

            if isinstance(existing_data, list) and isinstance(updated_data, list):
                existing_data = updated_data
            elif isinstance(existing_data, dict) and isinstance(updated_data, dict):
                existing_data.update(updated_data)
            else:
                return JsonResponse({"error": "Invalid data format"}, status=400)

            write_to_db(self.model_name, existing_data)
            return JsonResponse(existing_data, safe=False)
        except ComponentData.DoesNotExist:
            return JsonResponse({"error": f"{self.model_name} does not exist in the database"}, status=404)

    def put(self, request):
        new_data = json.loads(request.body)
        write_to_db(self.model_name, new_data)
        return JsonResponse(new_data, safe=False)



class CarouselView(JsonDBView):
    model_name = 'carousel_data'
class AirlinesView(JsonDBView):
    model_name = 'airlines'
class AppView(JsonDBView):
    model_name = 'app'
class FLightView(JsonDBView):
    model_name = 'flights'


def get_service_slugs(request):
    data = ComponentData.objects.get(name="services_page_data").data

    result = [{'slug': data['slug'], 'title': data['title']} for data in data]
    return JsonResponse(result,safe=False)



from rest_framework.generics import ListCreateAPIView
from .models import UploadedImage
from .serializers import UploadedImageSerializer

class UploadedImageViewSet(ListCreateAPIView):
    queryset = UploadedImage.objects.all()
    serializer_class = UploadedImageSerializer

class RetrieveImage(generics.RetrieveUpdateDestroyAPIView):
    queryset = UploadedImage.objects.all()
    serializer_class = UploadedImageSerializer