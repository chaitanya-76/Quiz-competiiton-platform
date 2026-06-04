from django.db import connection
from django.db.migrations.recorder import MigrationRecorder
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


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
            from accounts.models import User

            result["accounts_user"] = "ok"
            result["user_count"] = User.objects.count()
        except Exception as exc:
            result["status"] = "error"
            result["accounts_user"] = str(exc)
            return Response(result, status=503)

        return Response(result)
