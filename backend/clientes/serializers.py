from rest_framework import serializers
from .models import Cliente


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

    def validate_nombre(self, value):
        value = ' '.join(value.split())
        if len(value) < 2:
            raise serializers.ValidationError('Ingresa un nombre válido.')
        return value

    def validate_ci(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('El CI / documento es obligatorio.')
        qs = Cliente.objects.filter(ci__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ya existe un cliente con este CI.')
        return value

    def validate_telefono(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('El teléfono es obligatorio.')
        return value

    def validate_correo(self, value):
        return value.strip().lower()
