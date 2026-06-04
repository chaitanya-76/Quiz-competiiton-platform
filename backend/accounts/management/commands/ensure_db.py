from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.db.migrations.recorder import MigrationRecorder


class Command(BaseCommand):
    help = "Verify database tables exist and apply migrations if needed."

    def handle(self, *args, **options):
        self.stdout.write("Running migrations...")
        call_command("migrate", "--noinput", verbosity=1)

        recorder = MigrationRecorder(connection)
        applied = sorted(m for m in recorder.applied_migrations() if m[0] in ("accounts", "quiz"))
        self.stdout.write(f"Applied migrations: {applied}")

        from accounts.models import User

        try:
            count = User.objects.count()
            self.stdout.write(self.style.SUCCESS(f"accounts_user table OK ({count} users)"))
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f"accounts_user check failed: {exc}"))

            applied_accounts = [m for m in recorder.applied_migrations() if m[0] == "accounts"]
            if applied_accounts:
                self.stdout.write(
                    "Migrations are marked applied but the user table is missing. "
                    "Resetting accounts/quiz migration records..."
                )
                call_command("migrate", "quiz", "zero", "--fake", "--noinput")
                call_command("migrate", "accounts", "zero", "--fake", "--noinput")

            self.stdout.write("Retrying migrations...")
            call_command("migrate", "--noinput", verbosity=2)

            try:
                count = User.objects.count()
                self.stdout.write(self.style.SUCCESS(f"Fixed. accounts_user table OK ({count} users)"))
            except Exception as retry_exc:
                raise SystemExit(
                    f"Database tables still missing after migrate: {retry_exc}\n"
                    "In Render Shell run:\n"
                    "  python manage.py showmigrations\n"
                    "  python manage.py ensure_db\n"
                    "If it still fails, delete and recreate the PostgreSQL database in Render, "
                    "re-link DATABASE_URL, and redeploy."
                ) from retry_exc
