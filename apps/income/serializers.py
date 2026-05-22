from rest_framework import serializers
from .models import Income


class IncomeSerializer(serializers.ModelSerializer):
    source_display = serializers.CharField(source='get_source_display', read_only=True)

    class Meta:
        model = Income
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'source_display')
