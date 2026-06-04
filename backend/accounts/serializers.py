from rest_framework import serializers
from .models import User


class LoginSerializer(serializers.Serializer):
    enrollment_no = serializers.CharField()
    password = serializers.CharField()

    def validate_enrollment_no(self, value):
        return value.strip().upper()


class ManualCreateUserSerializer(serializers.Serializer):
    enrollment_no = serializers.CharField()
    name = serializers.CharField()
    year = serializers.ChoiceField(choices=["1", "2", "3"])

    def validate_enrollment_no(self, value):
        normalized = value.strip().upper()
        if len(normalized) < 6:
            raise serializers.ValidationError(
                "Enrollment number must be at least 6 characters."
            )
        return normalized

    def validate_name(self, value):
        return value.strip()