from decimal import Decimal
from uuid import uuid4

from django.db.models import Sum
from rest_framework import serializers
from .models import Reserva


class ReservaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cliente_ci = serializers.CharField(source='cliente.ci', read_only=True)
    habitacion_numero = serializers.CharField(source='habitacion.numero', read_only=True)
    habitacion_tipo = serializers.CharField(source='habitacion.tipo', read_only=True)
    habitacion_precio = serializers.DecimalField(source='habitacion.precio', max_digits=10, decimal_places=2, read_only=True)
    noches = serializers.SerializerMethodField()
    total_estimado = serializers.SerializerMethodField()
    total_pagado = serializers.SerializerMethodField()
    saldo_pendiente = serializers.SerializerMethodField()
    estado_pago = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            'id','codigo_reserva','nombre_cliente','cliente','cliente_nombre','cliente_ci',
            'habitacion','habitacion_numero','habitacion_tipo','habitacion_precio',
            'fecha_entrada','fecha_salida','cantidad_personas','estado','fecha_creacion',
            'noches','total_estimado','total_pagado','saldo_pendiente','estado_pago',
        ]
        read_only_fields = ['fecha_creacion','nombre_cliente']
        extra_kwargs = {'codigo_reserva': {'required': False}}

    def get_noches(self, obj):
        if obj.fecha_entrada and obj.fecha_salida:
            return max((obj.fecha_salida - obj.fecha_entrada).days, 0)
        return 0

    def get_total_estimado(self, obj):
        if not obj.habitacion:
            return None
        return obj.habitacion.precio * self.get_noches(obj)

    def get_total_pagado(self, obj):
        annotated = getattr(obj, 'total_pagado_calc', None)
        if annotated is not None:
            return annotated
        return obj.pago_set.filter(estado_pago='pagado').aggregate(total=Sum('monto'))['total'] or Decimal('0.00')

    def get_saldo_pendiente(self, obj):
        total = self.get_total_estimado(obj)
        if total is None:
            return None
        return max(total - self.get_total_pagado(obj), Decimal('0.00'))

    def get_estado_pago(self, obj):
        total = self.get_total_estimado(obj)
        if total is None:
            return 'sin_total'
        pagado = self.get_total_pagado(obj)
        saldo = max(total - pagado, Decimal('0.00'))
        if pagado <= 0:
            return 'pendiente'
        if saldo > 0:
            return 'parcial'
        return 'pagado'

    def validate(self, attrs):
        instance = self.instance
        fecha_entrada = attrs.get('fecha_entrada', getattr(instance, 'fecha_entrada', None))
        fecha_salida = attrs.get('fecha_salida', getattr(instance, 'fecha_salida', None))
        cantidad = attrs.get('cantidad_personas', getattr(instance, 'cantidad_personas', 1))
        habitacion = attrs.get('habitacion', getattr(instance, 'habitacion', None))
        cliente = attrs.get('cliente', getattr(instance, 'cliente', None))
        estado = attrs.get('estado', getattr(instance, 'estado', 'pendiente'))

        if instance is None:
            if not cliente:
                raise serializers.ValidationError({'cliente': 'Selecciona un cliente.'})
            if not habitacion:
                raise serializers.ValidationError({'habitacion': 'Selecciona una habitación.'})

        if fecha_entrada and fecha_salida and fecha_salida <= fecha_entrada:
            raise serializers.ValidationError({'fecha_salida': 'La salida debe ser posterior a la entrada.'})
        if cantidad is not None and cantidad < 1:
            raise serializers.ValidationError({'cantidad_personas': 'Debe hospedarse al menos 1 persona.'})
        if habitacion and habitacion.estado == 'mantenimiento' and estado not in {'cancelada','finalizada'}:
            raise serializers.ValidationError({'habitacion': 'La habitación está en mantenimiento.'})

        if habitacion and fecha_entrada and fecha_salida and estado in {'pendiente','confirmada'}:
            solapadas = Reserva.objects.filter(
                habitacion=habitacion,
                estado__in=['pendiente','confirmada'],
                fecha_entrada__lt=fecha_salida,
                fecha_salida__gt=fecha_entrada,
            )
            if instance:
                solapadas = solapadas.exclude(pk=instance.pk)
            if solapadas.exists():
                raise serializers.ValidationError({'habitacion': 'La habitación ya está reservada en parte de ese periodo.'})
        return attrs

    def create(self, validated_data):
        cliente = validated_data['cliente']
        validated_data['nombre_cliente'] = cliente.nombre
        if not validated_data.get('codigo_reserva'):
            validated_data['codigo_reserva'] = f"RES-{uuid4().hex[:8].upper()}"
        return super().create(validated_data)

    def update(self, instance, validated_data):
        cliente = validated_data.get('cliente', instance.cliente)
        if cliente:
            validated_data['nombre_cliente'] = cliente.nombre
        return super().update(instance, validated_data)
