from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers

from .models import Pago


class PagoSerializer(serializers.ModelSerializer):
    codigo_reserva = serializers.CharField(source='reserva.codigo_reserva', read_only=True)
    cliente_nombre = serializers.CharField(source='reserva.cliente.nombre', read_only=True, allow_null=True)
    nombre_cliente = serializers.CharField(source='reserva.nombre_cliente', read_only=True)
    habitacion_numero = serializers.CharField(source='reserva.habitacion.numero', read_only=True, allow_null=True)
    total_reserva = serializers.SerializerMethodField()
    total_pagado_reserva = serializers.SerializerMethodField()
    saldo_reserva = serializers.SerializerMethodField()

    class Meta:
        model = Pago
        fields = [
            'id', 'reserva', 'codigo_reserva', 'cliente_nombre', 'nombre_cliente',
            'habitacion_numero', 'monto', 'metodo_pago', 'estado_pago', 'fecha_pago',
            'total_reserva', 'total_pagado_reserva', 'saldo_reserva',
        ]
        read_only_fields = ['fecha_pago']

    def _total_reserva(self, reserva):
        if not reserva or not reserva.habitacion or not reserva.fecha_entrada or not reserva.fecha_salida:
            return None
        noches = max((reserva.fecha_salida - reserva.fecha_entrada).days, 0)
        return reserva.habitacion.precio * noches

    def _total_pagado(self, reserva, exclude_pk=None):
        if not reserva:
            return Decimal('0.00')
        qs = Pago.objects.filter(reserva=reserva, estado_pago='pagado')
        if exclude_pk:
            qs = qs.exclude(pk=exclude_pk)
        return qs.aggregate(total=Sum('monto'))['total'] or Decimal('0.00')

    def get_total_reserva(self, obj):
        return self._total_reserva(obj.reserva)

    def get_total_pagado_reserva(self, obj):
        return self._total_pagado(obj.reserva)

    def get_saldo_reserva(self, obj):
        total = self._total_reserva(obj.reserva)
        if total is None:
            return None
        return max(total - self._total_pagado(obj.reserva), Decimal('0.00'))

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError('El monto debe ser mayor a 0.')
        return value

    def validate(self, attrs):
        instance = self.instance
        reserva = attrs.get('reserva', getattr(instance, 'reserva', None))
        monto = attrs.get('monto', getattr(instance, 'monto', None))
        estado = attrs.get('estado_pago', getattr(instance, 'estado_pago', 'pendiente'))

        if not reserva:
            raise serializers.ValidationError({'reserva': 'Selecciona una reserva.'})
        if reserva.estado == 'cancelada':
            raise serializers.ValidationError({'reserva': 'No se pueden registrar pagos en una reserva cancelada.'})

        total = self._total_reserva(reserva)
        if total is None:
            raise serializers.ValidationError({'reserva': 'La reserva necesita una habitación y fechas válidas para calcular su total.'})

        if estado == 'pagado' and monto is not None:
            pagado_previo = self._total_pagado(reserva, exclude_pk=getattr(instance, 'pk', None))
            saldo_disponible = total - pagado_previo
            if monto > saldo_disponible:
                raise serializers.ValidationError({
                    'monto': f'El pago excede el saldo pendiente de Bs {saldo_disponible:.2f}.'
                })
        return attrs
