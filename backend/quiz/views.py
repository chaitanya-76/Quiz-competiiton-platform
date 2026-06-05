from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Avg, Max
from .models import Question
from .serializers import QuestionSerializer
from .models import Question, StudentAnswer, Submission
from .serializers import QuestionSerializer, SubmitQuizSerializer
from accounts.models import User
import csv
from django.http import HttpResponse
from io import TextIOWrapper
from django.db.models import Count
from django.http import HttpResponse

class QuestionListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        questions = Question.objects.filter(
            year=user.year
        )

        serializer = QuestionSerializer(
            questions,
            many=True
        )

        return Response(serializer.data)
    
class SubmitQuizView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        if user.is_attempted:
            return Response(
                {"error": "Quiz already submitted"},
                status=400
            )

        serializer = SubmitQuizSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        answers = serializer.validated_data["answers"]
        
        question_ids = []

        for answer in answers:

            question_id = answer["question_id"]

            if question_id in question_ids:
                return Response(
                    {
                        "error": "Duplicate question detected"
                    },
                    status=400
                )

            question_ids.append(question_id)

        score = 0

        for answer in answers:

            question = Question.objects.get(
                id=answer["question_id"],
                year=user.year
            )

            selected_option = answer["selected_option"]

            StudentAnswer.objects.create(
                user=user,
                question=question,
                selected_option=selected_option
            )

            if selected_option == question.correct_option:
                score += question.marks

        Submission.objects.create(
            user=user,
            score=score
        )

        user.is_attempted = True
        user.save()

        return Response({
            "message": "Quiz submitted successfully",
            "score": score
        })
        
        
        
class LeaderboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        submissions = Submission.objects.select_related(
            "user"
        ).order_by(
            "-score",
            "submitted_at"
        )

        data = []

        rank = 1

        for submission in submissions:

            data.append({
                "rank": rank,
                "name": submission.user.name,
                "enrollment_no": submission.user.enrollment_no,
                "year": submission.user.year,
                "score": submission.score,
                "violations":submission.user.violation_count
            })

            rank += 1

        return Response(data)
    
class ExportResultsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        submissions = Submission.objects.select_related(
            "user"
        ).order_by(
            "-score",
            "submitted_at"
        )

        response = HttpResponse(
            content_type="text/csv"
        )

        response[
            "Content-Disposition"
        ] = 'attachment; filename="quiz_results.csv"'

        writer = csv.writer(response)

        writer.writerow([
            "Rank",
            "Name",
            "Enrollment No",
            "Year",
            "Score"
        ])

        rank = 1

        for submission in submissions:

            writer.writerow([
                rank,
                submission.user.name,
                submission.user.enrollment_no,
                submission.user.year,
                submission.score
            ])

            rank += 1

        return response
    
QUIZ_DURATION_SECONDS = 60 * 60


class QuizStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_attempted:
            return Response({
                "attempted": True,
                "seconds_remaining": 0,
                "violations": user.violation_count,
            })

        if user.quiz_started_at is None:
            user.quiz_started_at = timezone.now()
            user.save(update_fields=["quiz_started_at"])

        elapsed = (timezone.now() - user.quiz_started_at).total_seconds()
        seconds_remaining = max(0, int(QUIZ_DURATION_SECONDS - elapsed))

        return Response({
            "attempted": False,
            "seconds_remaining": seconds_remaining,
            "violations": user.violation_count,
        })
        
class AdminStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        total_students = User.objects.filter(
            is_admin_user=False
        ).count()

        total_submissions = Submission.objects.count()

        highest_score = Submission.objects.aggregate(
            Max("score")
        )["score__max"] or 0

        average_score = Submission.objects.aggregate(
            Avg("score")
        )["score__avg"] or 0

        return Response({
            "total_students": total_students,
            "total_submissions": total_submissions,
            "highest_score": highest_score,
            "average_score": round(average_score, 2)
        })
        
class BulkQuestionImportView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        csv_file = request.FILES.get("file")

        if not csv_file:
            return Response(
                {"error": "CSV file is required"},
                status=400
            )

        decoded_file = TextIOWrapper(
            csv_file.file,
            encoding="utf-8"
        )

        reader = csv.DictReader(decoded_file)

        created = 0

        for row in reader:

            Question.objects.create(
                year=row["year"].strip(),
                question_text=row["question_text"].strip(),
                option_a=row["option_a"].strip(),
                option_b=row["option_b"].strip(),
                option_c=row["option_c"].strip(),
                option_d=row["option_d"].strip(),
                correct_option=row["correct_option"].strip(),
                marks=int(row["marks"])
            )

            created += 1

        return Response({
            "created": created
        })

class DeleteQuestionsByYearView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, year):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        deleted_count, _ = Question.objects.filter(
            year=year
        ).delete()

        return Response({
            "message": f"{deleted_count} questions deleted",
            "year": year
        })

class QuestionStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        data = {
            "year_1": Question.objects.filter(year="1").count(),
            "year_2": Question.objects.filter(year="2").count(),
            "year_3": Question.objects.filter(year="3").count(),
        }

        return Response(data)

class QuestionsByYearView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, year):

        if not request.user.is_admin_user:
            return Response(
                {"error": "Unauthorized"},
                status=403
            )

        questions = Question.objects.filter(
            year=year
        )

        data = []

        for question in questions:
            data.append({
                "id": question.id,
                "question_text": question.question_text,
                "correct_option": question.correct_option,
                "marks": question.marks
            })

        return Response(data)

class RecordViolationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        user.violation_count += 1

        user.save()

        return Response({
            "violations": user.violation_count
        })