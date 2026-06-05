from django.core.management import call_command
from django.db import connection
from django.db.migrations.recorder import MigrationRecorder


def accounts_schema_ready():
    """Verify the live DB schema matches the User model (not just COUNT queries)."""
    from accounts.models import User

    table = User._meta.db_table
    with connection.cursor() as cursor:
        description = connection.introspection.get_table_description(cursor, table)
    column_names = {col.name for col in description}
    return "quiz_started_at" in column_names


def ensure_database():
    """Apply migrations and repair stale migration state if tables are missing."""
    call_command("migrate", "--noinput", verbosity=1)

    if not accounts_schema_ready():
        call_command("migrate", "accounts", "--noinput", verbosity=2)

    recorder = MigrationRecorder(connection)
    applied = sorted(m for m in recorder.applied_migrations() if m[0] in ("accounts", "quiz"))

    from accounts.models import User

    try:
        if not accounts_schema_ready():
            raise RuntimeError(
                "accounts_user table is missing the quiz_started_at column. "
                "Run migrations (0004_user_quiz_started_at) on the server."
            )

        # Full row read — same as login authenticate()
        User.objects.values("id").first()
        user_count = User.objects.count()
        return {
            "status": "ok",
            "message": "Database ready",
            "user_count": user_count,
            "migrations": {app: name for app, name in applied},
            "schema_ready": True,
        }
    except Exception as exc:
        applied_accounts = [m for m in recorder.applied_migrations() if m[0] == "accounts"]
        if applied_accounts and not accounts_schema_ready():
            call_command("migrate", "quiz", "zero", "--fake", "--noinput")
            call_command("migrate", "accounts", "zero", "--fake", "--noinput")
            call_command("migrate", "--noinput", verbosity=2)

        applied = sorted(m for m in recorder.applied_migrations() if m[0] in ("accounts", "quiz"))

        try:
            if not accounts_schema_ready():
                raise RuntimeError(
                    "accounts_user table is missing the quiz_started_at column after migrate."
                ) from exc

            User.objects.values("id").first()
            user_count = User.objects.count()
            return {
                "status": "ok",
                "message": "Database repaired and ready",
                "user_count": user_count,
                "migrations": {app: name for app, name in applied},
                "schema_ready": True,
                "repaired": True,
                "previous_error": str(exc),
            }
        except Exception as retry_exc:
            return {
                "status": "error",
                "message": str(retry_exc),
                "previous_error": str(exc),
                "schema_ready": accounts_schema_ready(),
            }
