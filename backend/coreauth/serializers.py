from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at', 'loyalty_points')

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_admin', 'profile']
        read_only_fields = ['id', 'email', 'is_admin']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        instance = super().update(instance, validated_data)
        
        # Update profile if data exists
        if profile_data and hasattr(instance, 'profile'):
            profile_serializer = self.fields['profile']
            profile_serializer.update(instance.profile, profile_data)
        
        return instance