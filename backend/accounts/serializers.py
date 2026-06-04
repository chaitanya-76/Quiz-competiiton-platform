from rest_framework import serializers
from .models import User


class LoginSerializer(serializers.Serializer):
    enrollment_no = serializers.CharField()
    password = serializers.CharField()

    def validate_enrollment_no(self, value):
        return value.strip().upper()