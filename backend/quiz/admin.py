from django.contrib import admin
from .models import Question
from .models import StudentAnswer
from .models import Submission


admin.site.register(Question)
admin.site.register(StudentAnswer)
admin.site.register(Submission)