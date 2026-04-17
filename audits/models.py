# audits/models.py
from django.contrib.auth.models import User
from django.db import models

class Report(models.Model):
    unique_user_id = models.CharField(max_length=36)  # Adjust the length as needed
    feedback = models.TextField()
    purpose = models.CharField(max_length=255, null=True, blank=True)
    outcome = models.CharField(max_length=255, null=True, blank=True)
    conversation_link = models.URLField(max_length=2048, unique=True)
    rating = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by User {self.unique_user_id} at {self.timestamp}"