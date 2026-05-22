from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'amount', 'category', 'date', 'user', 'is_recurring')
    list_filter = ('category', 'is_recurring', 'date')
    search_fields = ('title', 'user__username')
