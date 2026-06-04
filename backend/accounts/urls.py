from django.urls import path
from .views import (
    LoginView,
    BulkImportView,
    ManualCreateUserView,
    StudentsByYearView,
    StudentStatsView,
)

urlpatterns = [
    path(
        "login/",
        LoginView.as_view()),
    path(
        "bulk-import/",
        BulkImportView.as_view(),
    ),
    path(
        "manual-create/",
        ManualCreateUserView.as_view(),
    ),
    path(
        "student-stats/",
        StudentStatsView.as_view()
    ),
    path(
        "students/<str:year>/",
        StudentsByYearView.as_view()
    ),
]