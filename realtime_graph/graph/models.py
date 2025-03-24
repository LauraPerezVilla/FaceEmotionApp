from django.db import models

# Create your models here.

class Session(models.Model):
    session_id = models.CharField(max_length=100, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.session_id

class Alert(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='alerts')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alert for session {self.session.session_id} at {self.created_at}"

class Prediction(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='predictions')
    angry = models.FloatField(null=False)
    disgust = models.FloatField(null=False)
    fear = models.FloatField(null=False)
    happy = models.FloatField(null=False)
    neutral = models.FloatField(null=False)
    sad = models.FloatField(null=False)
    surprise = models.FloatField(null=False)
    full_response = models.JSONField(null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prediction for session {self.session.session_id} at {self.created_at}"