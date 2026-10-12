from rest_framework import serializers
from .models import CheckinCheckout


class CheckinCheckoutSerializer(serializers.ModelSerializer):
    codigo_reserva = serializers.CharField(source='reserva.codigo_reserva', read_only=True)
    cliente_nombre = serializers.CharField(source='reserva.cliente.nombre', read_only=True, allow_null=True)
    nombre_cliente = serializers.CharField(source='reserva.nombre_cliente', read_only=True)
    habitacion_numero = serializers.CharField(source='reserva.habitacion.numero', read_only=True, allow_null=True)
    fecha_entrada = serializers.DateField(source='reserva.fecha_entrada', read_only=True)
    fecha_salida = serializers.DateField(source='reserva.fecha_salida', read_only=True)
    reserva_estado = serializers.CharField(source='reserva.estado', read_only=True)

    class Meta:
        model = CheckinCheckout
        fields = [
            'id', 'reserva', 'codigo_reserva', 'cliente_nombre', 'nombre_cliente',
            'habitacion_numero', 'fecha_entrada', 'fecha_salida', 'reserva_estado',
            'fecha_checkin', 'fecha_checkout', 'estado', 'observaciones',
        ]
        read_only_fields = ['fecha_checkin', 'fecha_checkout', 'estado']
