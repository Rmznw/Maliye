from django.urls import path
from .views import DashboardView, ByCategoryView, MonthlyView, BalanceTrendView, AIAdviceView, ParseExpenseView, MonthlySummaryView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='analytics-dashboard'),
    path('by-category/', ByCategoryView.as_view(), name='analytics-by-category'),
    path('monthly/', MonthlyView.as_view(), name='analytics-monthly'),
    path('balance-trend/', BalanceTrendView.as_view(), name='analytics-balance-trend'),
    path('ai-advice/', AIAdviceView.as_view(), name='ai-advice'),
    path('parse-expense/', ParseExpenseView.as_view(), name='parse-expense'),
    path('monthly-summary/', MonthlySummaryView.as_view(), name='monthly-summary'),
]
