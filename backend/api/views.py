
from django.http import JsonResponse
from .models import *
from .models import ComponentData

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser


def write_to_db(model_name, data):
    """
    Write JSON data to the database.
    """
    component, created = ComponentData.objects.get_or_create(name=model_name)
    component.data = data
    component.save()


class ComponentDataView(APIView):
    """
    Generic GET/PATCH/PUT/DELETE for a named ComponentData JSON blob.

    Backs the inline-editable ("CMS") sections of the site — Footer, hero
    sections, Medical Tourism blocks, and other informational content.
    GET is public. Write methods require an admin (is_staff) account, since
    the frontend gates its edit UI on the same authToken used to log in.

    `model_name` can be set on a subclass (legacy components below) or
    supplied via the `name` URL kwarg for the generic `home/<name>/` route.
    """
    model_name = None

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def _name(self):
        return self.model_name or self.kwargs.get('name')

    def get(self, request, *args, **kwargs):
        try:
            component = ComponentData.objects.get(name=self._name())
            return Response(component.data)
        except ComponentData.DoesNotExist:
            return Response({"error": f"{self._name()} does not exist in the database"}, status=404)

    def patch(self, request, *args, **kwargs):
        name = self._name()
        component, created = ComponentData.objects.get_or_create(name=name, defaults={"data": request.data})
        if not created:
            existing_data = component.data
            incoming_data = request.data
            if isinstance(existing_data, list) and isinstance(incoming_data, list):
                existing_data = incoming_data
            elif isinstance(existing_data, dict) and isinstance(incoming_data, dict):
                existing_data.update(incoming_data)
            else:
                existing_data = incoming_data
            component.data = existing_data
            component.save()
        return Response(component.data)

    def put(self, request, *args, **kwargs):
        write_to_db(self._name(), request.data)
        return Response(request.data)

    def delete(self, request, *args, **kwargs):
        ComponentData.objects.filter(name=self._name()).delete()
        return Response(status=204)


# Legacy fixed-name components (kept for backward compatibility with
# existing explicit URLs below). New sections should use the generic
# `home/<name>/` route instead of adding a subclass here.
class CarouselView(ComponentDataView):
    model_name = 'carousel_data'
class AirlinesView(ComponentDataView):
    model_name = 'airlines'
class AppView(ComponentDataView):
    model_name = 'app'
class FLightView(ComponentDataView):
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


from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, permissions

MEDICAL_TOURISM_INQUIRY_RECIPIENT = "sunwaybd@jghealthcare.com"


class MedicalTourismInquiryView(APIView):
    """Public endpoint for the Medical Tourism contact form.
    Uses the standard EMAIL_* settings (console backend until SMTP is configured)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        full_name = (data.get('full_name') or '').strip()
        phone = (data.get('phone') or '').strip()

        if not full_name or not phone:
            return Response(
                {"error": "full_name and phone are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = (data.get('email') or '').strip()
        country = (data.get('country') or '').strip()
        treatment = (data.get('treatment') or '').strip()
        message = (data.get('message') or '').strip()

        body = (
            f"New Medical Tourism inquiry from stechholidays.com\n\n"
            f"Full name: {full_name}\n"
            f"Phone: {phone}\n"
            f"Email: {email or '-'}\n"
            f"Country of interest: {country or '-'}\n"
            f"Treatment needed: {treatment or '-'}\n\n"
            f"Message:\n{message or '-'}\n"
        )

        send_mail(
            subject=f"Medical Tourism Inquiry — {full_name}",
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[MEDICAL_TOURISM_INQUIRY_RECIPIENT],
            fail_silently=False,
        )

        return Response({"success": True})