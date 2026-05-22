from django.urls import path

from .views import BalanceTrendView, ByCategoryView, DashboardView, MonthlyView

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="analytics-dashboard"),
    path("by-category/", ByCategoryView.as_view(), name="analytics-by-category"),
    path("monthly/", MonthlyView.as_view(), name="analytics-monthly"),
    path("balance-trend/", BalanceTrendView.as_view(), name="analytics-balance-trend"),
]
