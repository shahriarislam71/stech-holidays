from django.db import models
import os
from django.utils.text import slugify

# Create your models here.

from django.db import models

class ComponentData(models.Model):
    name = models.CharField(max_length=255, unique=True)  # Component identifier
    data = models.JSONField()  # Use the built-in JSONField
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name





class UploadedImage(models.Model):
    category = models.CharField(max_length=255)
    image = models.FileField(upload_to="uploaded_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.image.name} - {self.category}"
        
    def save(self, *args, **kwargs):
        # Ensure the filename is not too long
        base_filename, ext = os.path.splitext(self.image.name)
        max_filename_length = 100  # Maximum allowed length for filename

        # Truncate filename if it's too long
        if len(base_filename) > max_filename_length:
            base_filename = base_filename[:max_filename_length]

        # Generate a safe filename
        new_filename = f"{slugify(base_filename)}{ext}"

        # Update the image name with the new filename
        self.image.name = f"uploaded_images/{new_filename}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.image.name} - {self.category}"

