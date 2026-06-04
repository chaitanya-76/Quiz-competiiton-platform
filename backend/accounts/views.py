from .models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.db import DatabaseError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
import csv
from io import TextIOWrapper

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            enrollment_no = serializer.validated_data["enrollment_no"].strip().upper()
            password = serializer.validated_data["password"]

            try:
                user = authenticate(
                    enrollment_no=enrollment_no,
                    password=password
                )
            except DatabaseError:
                return Response(
                    {"error": "Database unavailable. Check migrations and DATABASE_URL."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            if user:

                refresh = RefreshToken.for_user(user)

                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "name": user.name,
                    "year": user.year,
                    "is_admin_user": user.is_admin_user,
                })

            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BulkImportView(APIView):
    def post(self, request):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        csv_file = request.FILES.get("file")

        if not csv_file:
            return Response(
                {"error": "CSV file is required"},
                status=400
            )

        decoded_file = TextIOWrapper(
            csv_file.file,
            encoding="utf-8"
        )

        reader = csv.DictReader(decoded_file)

        created = 0
        skipped = 0

        for row in reader:

            enrollment_no = row["enrollment_no"].strip().upper()       

            if User.objects.filter(
                enrollment_no=enrollment_no
            ).exists():

                skipped += 1
                continue

            password = enrollment_no[-6:]

            User.objects.create_user(
                enrollment_no=enrollment_no,
                name=row["name"].strip(),
                year=row["year"].strip(),
                password=password
            )

            created += 1

        return Response({
            "created": created,
            "skipped": skipped
        })

class StudentStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        data = {
            "year_1": User.objects.filter(
                year="1",
                is_admin_user=False
            ).count(),

            "year_2": User.objects.filter(
                year="2",
                is_admin_user=False
            ).count(),

            "year_3": User.objects.filter(
                year="3",
                is_admin_user=False
            ).count(),
        }

        return Response(data)

class StudentsByYearView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, year):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        students = User.objects.filter(
            year=year,
            is_admin_user=False
        ).order_by("name")

        data = []

        for student in students:

            data.append({
                "name": student.name,
                "enrollment_no": student.enrollment_no,
                "attempted": student.is_attempted
            })

        return Response(data)