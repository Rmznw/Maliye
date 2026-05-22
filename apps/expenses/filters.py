import django_filters
from .models import Expense


class ExpenseFilter(django_filters.FilterSet):
    month = django_filters.NumberFilter(field_name='date', lookup_expr='month')
    year = django_filters.NumberFilter(field_name='date', lookup_expr='year')
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = Expense
        fields = ['category', 'is_recurring', 'month', 'year', 'date_from', 'date_to']
