from rest_framework import serializers
from .models import Habitacion


class HabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = '__all__'

    def validate_numero(self, value):
        value = value.strip()
        qs = Habitacion.objects.filter(numero__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ya existe una habitación con este número.')
        return value

    def validate_tipo(self, value):
        value = ' '.join(value.split())
        if not value:
            raise serializers.ValidationError('Indica el tipo de habitación.')
        return value

    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError('El precio debe ser mayor a 0.')
        return value
