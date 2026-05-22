from celery import shared_task
from django.utils import timezone


@shared_task
def create_recurring_expenses():
    from .models import Expense

    today = timezone.now().date()
    recurring = Expense.objects.filter(is_recurring=True)

    created = 0
    for expense in recurring:
        should_create = False
        if expense.recurrence_frequency == 'daily':
            should_create = True
        elif expense.recurrence_frequency == 'weekly' and today.weekday() == expense.date.weekday():
            should_create = True
        elif expense.recurrence_frequency == 'monthly' and today.day == expense.date.day:
            should_create = True

        if should_create:
            already_exists = Expense.objects.filter(
                user=expense.user,
                title=expense.title,
                date=today,
                is_recurring=False,
            ).exists()
            if not already_exists:
                Expense.objects.create(
                    user=expense.user,
                    title=expense.title,
                    amount=expense.amount,
                    category=expense.category,
                    date=today,
                    is_recurring=False,
                    notes=f'Auto-created from recurring expense #{expense.id}',
                )
                created += 1

    return f'Created {created} recurring expenses for {today}'
