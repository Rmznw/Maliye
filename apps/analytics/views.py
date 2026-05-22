from datetime import date
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.expenses.models import Expense
from apps.income.models import Income


class DashboardView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        today = timezone.now().date()
        user = request.user

        total_income = Income.objects.filter(
            user=user,
            month__year=today.year,
            month__month=today.month,
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

        total_expenses = Expense.objects.filter(
            user=user,
            date__year=today.year,
            date__month=today.month,
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

        net_balance = total_income - total_expenses
        budget_remaining = None
        if user.monthly_budget:
            budget_remaining = user.monthly_budget - total_expenses

        return Response(
            {
                "month": today.strftime("%B %Y"),
                "total_income": total_income,
                "total_expenses": total_expenses,
                "net_balance": net_balance,
                "monthly_budget": user.monthly_budget,
                "budget_remaining": budget_remaining,
                "currency": user.currency,
            }
        )


class ByCategoryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        year = request.query_params.get("year", timezone.now().year)
        month = request.query_params.get("month", timezone.now().month)

        qs = (
            Expense.objects.filter(
                user=request.user,
                date__year=year,
                date__month=month,
            )
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        total = sum(item["total"] for item in qs) or Decimal("1")
        data = [
            {
                "category": item["category"],
                "total": item["total"],
                "percentage": round(float(item["total"]) / float(total) * 100, 1),
            }
            for item in qs
        ]
        return Response(data)


class MonthlyView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        income_qs = (
            Income.objects.filter(user=user)
            .annotate(month_trunc=TruncMonth("month"))
            .values("month_trunc")
            .annotate(total=Sum("amount"))
            .order_by("-month_trunc")[:6]
        )

        expense_qs = (
            Expense.objects.filter(user=user)
            .annotate(month_trunc=TruncMonth("date"))
            .values("month_trunc")
            .annotate(total=Sum("amount"))
            .order_by("-month_trunc")[:6]
        )

        income_map = {item["month_trunc"].date(): item["total"] for item in income_qs}
        expense_map = {item["month_trunc"].date(): item["total"] for item in expense_qs}

        all_months = sorted(
            set(list(income_map.keys()) + list(expense_map.keys())), reverse=True
        )[:6]

        data = [
            {
                "month": m.strftime("%b %Y"),
                "income": income_map.get(m, Decimal("0")),
                "expenses": expense_map.get(m, Decimal("0")),
                "net": income_map.get(m, Decimal("0"))
                - expense_map.get(m, Decimal("0")),
            }
            for m in sorted(all_months)
        ]
        return Response(data)


class BalanceTrendView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        today = timezone.now().date()
        user = request.user

        expenses = (
            Expense.objects.filter(  # pyright: ignore[reportAttributeAccessIssue]
                user=user,
                date__year=today.year,
                date__month=today.month,
            )
            .values("date")
            .annotate(total=Sum("amount"))
            .order_by("date")
        )

        total_income = Income.objects.filter(
            user=user,
            month__year=today.year,
            month__month=today.month,
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

        expense_by_day = {item["date"]: item["total"] for item in expenses}

        running_balance = float(total_income)
        data = []
        for day in range(1, today.day + 1):
            d = date(today.year, today.month, day)
            running_balance -= float(expense_by_day.get(d, Decimal("0")))
            data.append({"date": d.isoformat(), "balance": round(running_balance, 2)})

        return Response(data)
