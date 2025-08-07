# permissions.py
from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users (checks is_admin flag).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)