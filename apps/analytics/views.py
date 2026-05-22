from datetime import date
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.expenses.models import Expense
from apps.income.models import Income


SYSTEM_PROMPT = """Sen "Talyp Maliýe" atly Türkmenistan talyplar üçin niýetlenen maliýe programmasyndaky akylly AI geňeşçisiň.

Esasy düzgünler:
- HER WAGT diňe TÜRKMEN dilinde jogap ber. Başga dilde ýazma.
- Ulanyjynyň hakyky maliýe maglumatlaryna esaslanýan, ANYK we PEÝDALY maslahat ber.
- Sanlary we göterimi ulanyp, hakyky mysallar getir.
- Gysga we düşnükli jogap ber (2-4 sözlem).
- Mysal: "Bu aý iýmite 450 TMT sarp etdiňiz — bu býujetiňiziň 45%-i. Tygşytlamak üçin..."
- Hiç wagt iňlisçe söz ulanma. Hemme zady türkmençe düşündir."""

PARSE_SYSTEM_PROMPT = """You are a data extraction engine. Your ONLY job is to extract structured expense data from bank SMS messages or receipts.
Output ONLY a valid raw JSON object — no markdown, no code fences, no explanation, no extra text whatsoever.
If a field cannot be determined, use sensible defaults. Never add commentary."""


def ask_ai(prompt: str, system: str = SYSTEM_PROMPT) -> str:
    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    completion = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': prompt},
        ],
        max_tokens=600,
        temperature=0.6,
    )
    return completion.choices[0].message.content.strip()


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


class AIAdviceView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        from apps.goals.models import SavingsGoal

        user = request.user
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'reply': 'Soralyňyzy ýazyň.'})

        today = timezone.now().date()
        total_income = (
            Income.objects.filter(user=user, month__year=today.year, month__month=today.month)
            .aggregate(total=Sum('amount'))['total'] or Decimal('0')
        )
        total_expenses = (
            Expense.objects.filter(user=user, date__year=today.year, date__month=today.month)
            .aggregate(total=Sum('amount'))['total'] or Decimal('0')
        )
        categories = (
            Expense.objects.filter(user=user, date__year=today.year, date__month=today.month)
            .values('category').annotate(total=Sum('amount')).order_by('-total')[:5]
        )
        goals = SavingsGoal.objects.filter(user=user, current_amount__lt=models.F('target_amount'))[:3]

        balance = float(total_income) - float(total_expenses)
        budget = float(user.monthly_budget or 0)
        cat_lines = '\n'.join([f"  • {c['category']}: {c['total']} TMT" for c in categories]) or '  • maglumat ýok'
        goal_lines = '\n'.join([f"  • {g.title}: {g.current_amount}/{g.target_amount} TMT ({g.progress_percentage:.0f}%)" for g in goals]) or '  • maksat ýok'
        budget_used = round(float(total_expenses) / budget * 100, 1) if budget else 0

        prompt = f"""Ulanyjynyň HAKYKY maliýe maglumatlary:

👤 Ulanyjy: {user.username}
📅 Aý: {today.strftime('%B %Y')}

💰 GIRDEJI: {total_income} TMT
💸 ÇYKDAJY: {total_expenses} TMT
📊 BALANS: {balance:.2f} TMT
🎯 BÝUJET: {budget} TMT ({budget_used}% ulanyldı)

📂 Kategoriýa boýunça çykdajy:
{cat_lines}

🏆 Işjeň maksatlar:
{goal_lines}

❓ Ulanyjynyň soragy: {message}

Bu hakyky maglumatlara esaslanyp, anyk we peýdaly maslahat ber. Maglumatlary göni ulanyp sanlary mention et."""

        try:
            reply = ask_ai(prompt)
            return Response({'reply': reply})
        except Exception as e:
            return Response({'reply': f'Häzir jogap berip bilemok: {e}'})


class ParseExpenseView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Text required'}, status=400)

        today = timezone.now().date().isoformat()
        prompt = f"""Extract expense data from this bank SMS or receipt text.

Text: "{text}"

Return this exact JSON structure:
{{
  "title": "<merchant or short description, max 40 chars>",
  "amount": <positive number, no currency symbol>,
  "category": "<one of: food, transport, education, internet, leisure, health, other>",
  "date": "<YYYY-MM-DD, use {today} if not in text>",
  "notes": "<any extra context, empty string if none>"
}}"""

        try:
            import json
            import re
            raw = ask_ai(prompt, system=PARSE_SYSTEM_PROMPT)
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if not match:
                return Response({'error': 'Maglumat çykarylyp bilinmedi. Başga tekst synanyşyň.'}, status=400)
            data = json.loads(match.group())
            return Response(data)
        except Exception as e:
            return Response({'error': f'Skanirläp bolmady: {e}'}, status=500)


class MonthlySummaryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from django.core.cache import cache
        from apps.goals.models import SavingsGoal

        user = request.user
        today = timezone.now().date()

        cache_key = f'monthly_summary:{user.id}:{today.year}:{today.month}:{today.day}'
        cached = cache.get(cache_key)
        if cached:
            return Response({'summary': cached, 'cached': True})

        total_income = (
            Income.objects.filter(user=user, month__year=today.year, month__month=today.month)
            .aggregate(total=Sum('amount'))['total'] or Decimal('0')
        )
        total_expenses = (
            Expense.objects.filter(user=user, date__year=today.year, date__month=today.month)
            .aggregate(total=Sum('amount'))['total'] or Decimal('0')
        )
        categories = (
            Expense.objects.filter(user=user, date__year=today.year, date__month=today.month)
            .values('category').annotate(total=Sum('amount')).order_by('-total')[:3]
        )
        goals_active = SavingsGoal.objects.filter(user=user, current_amount__lt=models.F('target_amount')).count()
        goals_done = SavingsGoal.objects.filter(user=user, current_amount__gte=models.F('target_amount')).count()
        cat_str = ', '.join([f"{c['category']}: {c['total']} TMT" for c in categories]) or 'ýok'
        budget = user.monthly_budget or 0
        savings = float(total_income) - float(total_expenses)
        savings_rate = round(savings / float(total_income) * 100, 1) if total_income else 0
        budget_used = round(float(total_expenses) / float(budget) * 100, 1) if budget else 0

        prompt = f"""{today.strftime('%B %Y')} aýy üçin ulanyjynyň maliýe ýagdaýy:

- Girdeji: {total_income} TMT
- Çykdajy: {total_expenses} TMT | Býujet: {budget} TMT ({budget_used}% ulanyldı)
- Tygşytlanan: {savings:.2f} TMT ({savings_rate}%)
- Iň köp çykdajy: {cat_str}
- Işjeň maksatlar: {goals_active} sany, tamamlanan: {goals_done} sany

Bu hakyky sanlara esaslanyp 2-3 sözlem jemleýji baha ber. Anyk sanlary mention et. Höweslendiriji we amaly maslahat ber."""

        try:
            text = ask_ai(prompt)
            cache.set(cache_key, text, 60 * 60 * 6)
            return Response({'summary': text})
        except Exception:
            return Response({'summary': ''})
