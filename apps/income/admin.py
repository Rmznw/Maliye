from django.contrib import admin
from .models import Income


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ('source', 'amount', 'month', 'user')
    list_filter = ('source', 'month')
    search_fields = ('user__username',)
