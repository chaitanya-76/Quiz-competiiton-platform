from django.db import models
from django.conf import settings


class Question(models.Model):

    YEAR_CHOICES = (
        ("1", "First Year"),
        ("2", "Second Year"),
        ("3", "Third Year"),
    )

    year = models.CharField(
        max_length=1,
        choices=YEAR_CHOICES
    )

    question_text = models.TextField()

    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)

    correct_option = models.CharField(max_length=1)
    
    marks = models.IntegerField(default=1)

    def __str__(self):
        return self.question_text[:50]


class StudentAnswer(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE
    )

    selected_option = models.CharField(max_length=1)

    answered_at = models.DateTimeField(auto_now_add=True)


class Submission(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    score = models.IntegerField(default=0)

    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.score}"
