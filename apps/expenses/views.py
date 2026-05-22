from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .filters import ExpenseFilter
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = (IsAuthenticated,)
    filterset_class = ExpenseFilter
    ordering_fields = ['date', 'amount', 'created_at']
    queryset = Expense.objects.none()

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
