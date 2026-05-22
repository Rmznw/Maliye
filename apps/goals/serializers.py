from rest_framework import serializers
from .models import SavingsGoal


class SavingsGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.FloatField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True, allow_null=True)
    is_completed = serializers.BooleanField(read_only=True)

    class Meta:
        model = SavingsGoal
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class AddFundsSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
