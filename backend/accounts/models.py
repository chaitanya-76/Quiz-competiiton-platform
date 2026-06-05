from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, enrollment_no, name, year, password=None):
        if not enrollment_no:
            raise ValueError("Enrollment Number is required")

        user = self.model(
            enrollment_no=enrollment_no,
            name=name,
            year=year,
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, enrollment_no, name, year, password=None):
        user = self.create_user(
            enrollment_no=enrollment_no,
            name=name,
            year=year,
            password=password,
        )

        user.is_staff = True
        user.is_superuser = True

        user.save(using=self._db)

        return user


class User(AbstractBaseUser, PermissionsMixin):
    YEAR_CHOICES = (
        ("1", "First Year"),
        ("2", "Second Year"),
        ("3", "Third Year"),
    )

    name = models.CharField(max_length=100)

    enrollment_no = models.CharField(
        max_length=50,
        unique=True
    )

    year = models.CharField(
        max_length=1,
        choices=YEAR_CHOICES
    )

    is_attempted = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    
    violation_count = models.IntegerField(default=0)

    quiz_started_at = models.DateTimeField(null=True, blank=True)

    is_staff = models.BooleanField(default=False)

    is_admin_user = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "enrollment_no"

    REQUIRED_FIELDS = ["name", "year"]

    def __str__(self):
        return f"{self.name} ({self.enrollment_no})"