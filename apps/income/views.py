from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Income
from .serializers import IncomeSerializer


class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Income.objects.none()

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='monthly-summary')
    def monthly_summary(self, request):
        qs = (
            self.get_queryset()
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('-month')[:12]
        )
        return Response(list(qs))
