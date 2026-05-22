from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    def validate(self, attrs):
        if attrs.get('is_recurring') and not attrs.get('recurrence_frequency'):
            raise serializers.ValidationError(
                {'recurrence_frequency': 'Required when is_recurring is true.'}
            )
        return attrs
