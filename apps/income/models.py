from django.conf import settings
from django.db import models


class Income(models.Model):
    SOURCES = [
        ('scholarship', 'Talyp haky'),
        ('salary', 'Iş aýlygy'),
        ('freelance', 'Freelance'),
        ('family', 'Maşgala'),
        ('other', 'Beýleki'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='incomes')
    source = models.CharField(max_length=20, choices=SOURCES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField(help_text='Store as first day of the month')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-month', '-created_at']

    def __str__(self):
        return f'{self.get_source_display()} — {self.amount} ({self.month.strftime("%b %Y")})'
