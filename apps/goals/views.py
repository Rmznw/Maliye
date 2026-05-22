from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer, AddFundsSerializer


class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = (IsAuthenticated,)
    queryset = SavingsGoal.objects.none()

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='add-funds')
    def add_funds(self, request, pk=None):
        goal = self.get_object()
        serializer = AddFundsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        goal.current_amount += serializer.validated_data['amount']
        goal.save(update_fields=['current_amount'])

        return Response(SavingsGoalSerializer(goal).data, status=status.HTTP_200_OK)
