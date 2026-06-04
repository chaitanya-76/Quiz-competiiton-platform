import os

from django.db import connection
from django.db.migrations.recorder import MigrationRecorder
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.db_setup import ensure_database
from accounts.models import User


class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        result = {"status": "ok", "database": "connected", "accounts_user": "unknown"}

        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception as exc:
            return Response(
                {"status": "error", "database": str(exc)},
                status=503,
            )

        recorder = MigrationRecorder(connection)
        result["migrations"] = {
            app: name for app, name in sorted(recorder.applied_migrations())
            if app in ("accounts", "quiz", "auth", "admin", "contenttypes", "sessions")
        }

        try:
            result["accounts_user"] = "ok"
            result["user_count"] = User.objects.count()
        except Exception as exc:
            result["status"] = "error"
            result["accounts_user"] = str(exc)
            return Response(result, status=503)

        return Response(result)


class SetupView(APIView):
    """One-time database setup via browser/curl — no Render Shell needed."""

    permission_classes = [AllowAny]

    def _check_secret(self, request):
        expected = os.getenv("SETUP_SECRET")
        if not expected:
            return False, "SETUP_SECRET environment variable is not configured on the server."

        provided = (
            request.headers.get("X-Setup-Secret")
            or request.query_params.get("secret")
        )
        if not provided or provided != expected:
            return False, "Invalid or missing setup secret."

        return True, None

    def get(self, request):
        ok, error = self._check_secret(request)
        if not ok:
            return Response({"error": error}, status=403)

        result = ensure_database()
        status_code = 200 if result["status"] == "ok" else 503
        return Response(result, status=status_code)

    def post(self, request):
        ok, error = self._check_secret(request)
        if not ok:
            return Response({"error": error}, status=403)

        result = ensure_database()
        if result["status"] != "ok":
            return Response(result, status=503)

        enrollment_no = request.data.get("enrollment_no")
        name = request.data.get("name")
        year = request.data.get("year", "1")
        password = request.data.get("password")

        if not enrollment_no or not name:
            return Response({**result, "user_created": False})

        if not password:
            password = enrollment_no.strip()[-6:]

        enrollment_no = enrollment_no.strip().upper()

        if User.objects.filter(enrollment_no=enrollment_no).exists():
            return Response({
                **result,
                "user_created": False,
                "message": f"User {enrollment_no} already exists",
            })

        User.objects.create_user(
            enrollment_no=enrollment_no,
            name=name.strip(),
            year=str(year).strip(),
            password=password,
        )

        result["user_count"] = User.objects.count()
        result["user_created"] = True
        result["enrollment_no"] = enrollment_no
        return Response(result)
