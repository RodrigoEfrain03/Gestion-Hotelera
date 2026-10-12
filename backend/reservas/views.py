from decimal import Decimal

from django.db.models import DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from habitaciones.models import Habitacion
from habitaciones.serializers import HabitacionSerializer
from .models import Reserva
from .serializers import ReservaSerializer
from usuarios.permissions import IsAdministrador


class ReservaViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if getattr(self, 'action', None) == 'destroy':
            return [IsAdministrador()]
        return super().get_permissions()
    serializer_class = ReservaSerializer

    def get_queryset(self):
        qs = Reserva.objects.select_related('cliente', 'habitacion').annotate(
            total_pagado_calc=Coalesce(
                Sum('pago__monto', filter=Q(pago__estado_pago='pagado')),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )
        estado = self.request.query_params.get('estado')
        search = self.request.query_params.get('search')
        if estado:
            qs = qs.filter(estado=estado)
        if search:
            qs = qs.filter(
                Q(codigo_reserva__icontains=search) |
                Q(nombre_cliente__icontains=search) |
                Q(cliente__ci__icontains=search) |
                Q(habitacion__numero__icontains=search)
            )
        return qs

    @action(detail=False, methods=['get'])
    def disponibilidad(self, request):
        entrada = request.query_params.get('fecha_entrada')
        salida = request.query_params.get('fecha_salida')
        reserva_id = request.query_params.get('reserva_id')
        if not entrada or not salida:
            return Response({'detail': 'Indica fecha_entrada y fecha_salida.'}, status=status.HTTP_400_BAD_REQUEST)
        if salida <= entrada:
            return Response({'detail': 'La salida debe ser posterior a la entrada.'}, status=status.HTTP_400_BAD_REQUEST)

        ocupadas = Reserva.objects.filter(
            estado__in=['pendiente','confirmada'],
            fecha_entrada__lt=salida,
            fecha_salida__gt=entrada,
            habitacion__isnull=False,
        )
        if reserva_id:
            ocupadas = ocupadas.exclude(pk=reserva_id)
        ocupadas_ids = ocupadas.values_list('habitacion_id', flat=True)
        habitaciones = Habitacion.objects.exclude(estado='mantenimiento').exclude(id__in=ocupadas_ids).order_by('numero')
        return Response(HabitacionSerializer(habitaciones, many=True).data)
