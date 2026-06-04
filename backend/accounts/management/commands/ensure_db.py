from django.core.management.base import BaseCommand

from accounts.db_setup import ensure_database


class Command(BaseCommand):
    help = "Verify database tables exist and apply migrations if needed."

    def handle(self, *args, **options):
        result = ensure_database()

        if result["status"] == "ok":
            self.stdout.write(self.style.SUCCESS(
                f"{result['message']} ({result['user_count']} users)"
            ))
            if result.get("repaired"):
                self.stdout.write(f"Previous error: {result['previous_error']}")
            return

        self.stdout.write(self.style.ERROR(result["message"]))
        if result.get("previous_error"):
            self.stdout.write(f"Previous error: {result['previous_error']}")
        raise SystemExit(
            "Database setup failed. Set SETUP_SECRET on Render and open "
            "/api/setup/?secret=YOUR_SECRET in a browser, or redeploy."
        )
