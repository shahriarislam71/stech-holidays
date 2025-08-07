from rest_framework import serializers
from .models import *
from datetime import date
import json

class HolidayPackageTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = HolidayPackageTag
        fields = ['name']

import re


# holidays_visa/serializers.py
class HolidayPackageDetailSerializer(serializers.ModelSerializer):
    activities = serializers.SerializerMethodField()

    class Meta:
        model = HolidayPackageDetail
        fields = ('day', 'title', 'activities')

    def get_activities(self, obj):
        # Split on "." or "\n" or ";" – tune as you like
        raw = obj.description.replace('\r', '').strip()
        # remove trailing punctuation and empty entries
        parts = [p.strip(" .") for p in re.split(r"[.\n;]", raw) if p.strip()]
        return parts

class HolidayPackageSerializer(serializers.ModelSerializer):
    details = HolidayPackageDetailSerializer(many=True, read_only=True)
    tags = HolidayPackageTagSerializer(many=True, read_only=True)
    featured_image = serializers.SerializerMethodField()
    

    class Meta:
        model = HolidayPackage
        fields = "__all__"
        
    def get_featured_image(self, obj):
        request = self.context.get('request')
        if obj.featured_image and hasattr(obj.featured_image, 'url'):
            return request.build_absolute_uri(obj.featured_image.url)
        return None

from rest_framework import serializers
from .models import HolidayBooking

class HolidayBookingSerializer(serializers.ModelSerializer):
    package = serializers.PrimaryKeyRelatedField(
        queryset=HolidayPackage.objects.all()
    ) 
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = HolidayBooking
        fields = "__all__"
        extra_kwargs = {
            'contact_name': {'required': True},
            'email': {'required': True},
            'phone': {'required': True},
            'departure_date': {'required': True},
            'travelers': {'required': True},
            'status': {'read_only': True}  # Make status read-only as it will be set automatically
        }

    def create(self, validated_data):
        # Set status to 'pending' by default when creating a new booking
        validated_data['status'] = 'pending'
        return super().create(validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['package'] = HolidayPackageSerializer(instance.package, context=self.context).data
        return rep
    
class VisaCountrySerializer(serializers.ModelSerializer):

    cover_image = serializers.SerializerMethodField()
    
    class Meta:
        model = VisaCountry
        fields = '__all__'

        
    def get_cover_image(self, obj):
        if obj.cover_image:
            return self.context['request'].build_absolute_uri(obj.cover_image.url)
        return None


class VisaApplicationSerializer(serializers.ModelSerializer):
    country = VisaCountrySerializer(read_only=True)
    visa_type = serializers.PrimaryKeyRelatedField(queryset=VisaType.objects.all())
    country_id = serializers.PrimaryKeyRelatedField(
        queryset=VisaCountry.objects.all(),
        source='country',
        write_only=True
    )
    documents = serializers.JSONField(required=False)
    
    class Meta:
        model = VisaApplication
        fields = "__all__"
        read_only_fields = [ 'created_at', 'reference_number']
    
    def validate_passport_expiry(self, value):
        if value < date.today():
            raise serializers.ValidationError("Passport must be valid (not expired)")
        return value
    
    def validate_departure_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Departure date must be in the future")
        return value

    def create(self, validated_data):
        # Calculate fees
        visa_type = validated_data['visa_type']
        travelers = validated_data['travelers']
        
        validated_data['visa_fee'] = visa_type.fee * travelers
        validated_data['processing_fee'] = visa_type.country.fee * travelers
        validated_data['total_amount'] = (visa_type.fee + visa_type.country.fee) * travelers
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Recalculate fees if travelers or visa type changes
        if 'travelers' in validated_data or 'visa_type' in validated_data:
            visa_type = validated_data.get('visa_type', instance.visa_type)
            travelers = validated_data.get('travelers', instance.travelers)
            
            validated_data['visa_fee'] = visa_type.fee * travelers
            validated_data['processing_fee'] = visa_type.country.fee * travelers
            validated_data['total_amount'] = (visa_type.fee + visa_type.country.fee) * travelers
            
        return super().update(instance, validated_data)


class VisaTypeSerializer(serializers.ModelSerializer):


    class Meta:
        model = VisaType
        fields = '__all__'


# holidays_visa/serializers.py

# Umrah
class UmrahPackageTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = UmrahPackageTag
        fields = ['name']

class UmrahPackageDetailSerializer(serializers.ModelSerializer):
    activities = serializers.SerializerMethodField()

    class Meta:
        model = UmrahPackageDetail
        fields = ('day', 'title', 'activities')

    def get_activities(self, obj):
        raw = obj.description.replace('\r', '').strip()
        parts = [p.strip(" .") for p in re.split(r"[.\n;]", raw) if p.strip()]
        return parts

class UmrahPackageSerializer(serializers.ModelSerializer):
    details = UmrahPackageDetailSerializer(many=True, read_only=True)
    tags = UmrahPackageTagSerializer(many=True, read_only=True)
    # featured_image = serializers.SerializerMethodField()
    
    class Meta:
        model = UmrahPackage
        fields = "__all__"
        
    # def get_featured_image(self, obj):
    #     request = self.context.get('request')
    #     if obj.featured_image and hasattr(obj.featured_image, 'url'):
    #         return request.build_absolute_uri(obj.featured_image.url)
    #     return None

class UmrahBookingSerializer(serializers.ModelSerializer):
    package = serializers.PrimaryKeyRelatedField(
        queryset=UmrahPackage.objects.all()
    ) 
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = UmrahBooking
        fields = "__all__"


    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['package'] = UmrahPackageSerializer(instance.package, context=self.context).data
        return rep
    

