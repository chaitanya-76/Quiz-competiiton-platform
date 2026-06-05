# Generated manually for quiz timer persistence

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_user_violation_count"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="quiz_started_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
