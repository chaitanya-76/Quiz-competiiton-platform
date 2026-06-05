from django.core.management import call_command
from django.db import connection
from django.db.migrations.recorder import MigrationRecorder

MIGRATION_0004 = ("accounts", "0004_user_quiz_started_at")


def accounts_schema_ready():
    """Verify the live DB schema matches the User model (not just COUNT queries)."""
    from accounts.models import User

    table = User._meta.db_table
    with connection.cursor() as cursor:
        description = connection.introspection.get_table_description(cursor, table)
    column_names = {col.name for col in description}
    return "quiz_started_at" in column_names


def _record_migration_0004_if_missing():
    recorder = MigrationRecorder(connection)
    if MIGRATION_0004 not in recorder.applied_migrations():
        call_command(
            "migrate",
            "accounts",
            "0004_user_quiz_started_at",
            "--fake",
            "--noinput",
        )


def repair_quiz_started_at_column():
    """
    Ensure quiz_started_at exists even if django_migrations is out of sync.
    Safe to run on every deploy — no-op when the column already exists.
    """
    if accounts_schema_ready():
        return True

    call_command("migrate", "accounts", "--noinput", verbosity=1)
    if accounts_schema_ready():
        return True

    from accounts.models import User

    field = User._meta.get_field("quiz_started_at")
    with connection.schema_editor() as schema_editor:
        schema_editor.add_field(User, field)

    _record_migration_0004_if_missing()
    return accounts_schema_ready()


def ensure_database():
    """Apply migrations and repair schema if needed."""
    call_command("migrate", "--noinput", verbosity=1)
    repair_quiz_started_at_column()

    recorder = MigrationRecorder(connection)
    applied = sorted(m for m in recorder.applied_migrations() if m[0] in ("accounts", "quiz"))

    from accounts.models import User

    if not accounts_schema_ready():
        return {
            "status": "error",
            "message": "quiz_started_at column could not be created on accounts_user.",
            "schema_ready": False,
            "migrations": {app: name for app, name in applied},
        }

    try:
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
        if applied_accounts:
            call_command("migrate", "quiz", "zero", "--fake", "--noinput")
            call_command("migrate", "accounts", "zero", "--fake", "--noinput")
            call_command("migrate", "--noinput", verbosity=2)
            repair_quiz_started_at_column()

        applied = sorted(m for m in recorder.applied_migrations() if m[0] in ("accounts", "quiz"))

        if not accounts_schema_ready():
            return {
                "status": "error",
                "message": str(exc),
                "schema_ready": False,
                "migrations": {app: name for app, name in applied},
            }

        try:
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
