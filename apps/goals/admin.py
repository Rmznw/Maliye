from django.contrib import admin
from .models import SavingsGoal


@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'target_amount', 'current_amount', 'deadline', 'user')
    search_fields = ('title', 'user__username')
