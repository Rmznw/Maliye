from django.conf import settings
from django.db import models


class Expense(models.Model):
    CATEGORIES = [
        ('food', 'Iýmit'),
        ('transport', 'Ulag'),
        ('education', 'Bilim'),
        ('internet', 'Internet'),
        ('leisure', 'Dynç alyş'),
        ('health', 'Saglyk'),
        ('other', 'Beýleki'),
    ]

    FREQUENCIES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    recurrence_frequency = models.CharField(max_length=10, choices=FREQUENCIES, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.title} — {self.amount} {self.user.currency}'
