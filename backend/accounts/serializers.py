from rest_framework import serializers
from .models import User


class LoginSerializer(serializers.Serializer):
    enrollment_no = serializers.CharField()
    password = serializers.CharField()