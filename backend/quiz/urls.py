from django.urls import path
from .views import QuestionListView
from .views import QuestionListView, SubmitQuizView, LeaderboardView, QuizStatusView, AdminStatsView, ExportResultsView, BulkQuestionImportView, DeleteQuestionsByYearView, QuestionStatsView, QuestionsByYearView, RecordViolationView

urlpatterns = [
    path(
        "questions/",
        QuestionListView.as_view()
    ),
    path(
        "submit/",
        SubmitQuizView.as_view()
    ),
    path(
        "leaderboard/",
        LeaderboardView.as_view()
    ),
    path(
        "status/",
        QuizStatusView.as_view()
    ),
    path(
        "admin-stats/",
        AdminStatsView.as_view()
    ),
    path(
        "export-results/",
        ExportResultsView.as_view()
    ),
    path(
        "bulk-question-import/",
        BulkQuestionImportView.as_view()
    ),
    path(
        "delete-questions/<str:year>/",
        DeleteQuestionsByYearView.as_view()
    ),
    path(
        "question-stats/",
        QuestionStatsView.as_view()
    ),
    path(
        "questions/<str:year>/",
        QuestionsByYearView.as_view()
    ),
    path(
        "record-violation/",
        RecordViolationView.as_view()
    ),
]