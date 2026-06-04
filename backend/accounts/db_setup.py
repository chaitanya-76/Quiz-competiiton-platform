from django.core.management import call_command
from django.db import connection
from django.db.migrations.recorder import MigrationRecorder


def ensure_database():
    """Apply migrations and repair stale migration state if tables are missing."""
    call_command("migrate", "--noinput", verbosity=1)

    recorder = MigrationRecorder(connection)
    applied = sorted(m for m in recorder.applied_migrations() if m[0] in ("accounts", "quiz"))

    from accounts.models import User

    try:
        user_count = User.objects.count()
        return {
            "status": "ok",
            "message": "Database ready",
            "user_count": user_count,
            "migrations": {app: name for app, name in applied},
        }
    except Exception as exc:
        applied_accounts = [m for m in recorder.applied_migrations() if m[0] == "accounts"]
        if applied_accounts:
            call_command("migrate", "quiz", "zero", "--fake", "--noinput")
            call_command("migrate", "accounts", "zero", "--fake", "--noinput")

        call_command("migrate", "--noinput", verbosity=2)

        applied = sorted(m for m in recorder.applied_migrations() if m[0] in ("accounts", "quiz"))

        try:
            user_count = User.objects.count()
            return {
                "status": "ok",
                "message": "Database repaired and ready",
                "user_count": user_count,
                "migrations": {app: name for app, name in applied},
                "repaired": True,
                "previous_error": str(exc),
            }
        except Exception as retry_exc:
            return {
                "status": "error",
                "message": str(retry_exc),
                "previous_error": str(exc),
            }
