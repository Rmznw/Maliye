from django.conf import settings
from django.db import models
from django.utils import timezone


class SavingsGoal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    cover_image = models.ImageField(upload_to='goal_covers/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def progress_percentage(self):
        if not self.target_amount:
            return 0
        return round(float(self.current_amount) / float(self.target_amount) * 100, 1)

    @property
    def days_remaining(self):
        if not self.deadline:
            return None
        delta = self.deadline - timezone.now().date()
        return max(0, delta.days)

    @property
    def is_completed(self):
        return self.current_amount >= self.target_amount
