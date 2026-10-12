from decimal import Decimal

from django.db.models import Q, Sum
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from reservas.models import Reserva
from .models import Pago
from .serializers import PagoSerializer
from usuarios.permissions import IsAdministrador


class PagoViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if getattr(self, 'action', None) == 'anular':
            return [IsAdministrador()]
        return super().get_permissions()
    serializer_class = PagoSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = Pago.objects.select_related(
            'reserva', 'reserva__cliente', 'reserva__habitacion'
        ).order_by('-fecha_pago', '-id')
        reserva_id = self.request.query_params.get('reserva')
        estado = self.request.query_params.get('estado')
        search = self.request.query_params.get('search')
        if reserva_id:
            qs = qs.filter(reserva_id=reserva_id)
        if estado:
            qs = qs.filter(estado_pago=estado)
        if search:
            qs = qs.filter(
                Q(reserva__codigo_reserva__icontains=search)
                | Q(reserva__nombre_cliente__icontains=search)
                | Q(reserva__cliente__nombre__icontains=search)
                | Q(reserva__cliente__ci__icontains=search)
                | Q(reserva__habitacion__numero__icontains=search)
                | Q(metodo_pago__icontains=search)
            )
        return qs

    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        pago = self.get_object()
        if pago.estado_pago == 'anulado':
            raise ValidationError({'detail': 'Este pago ya está anulado.'})
        pago.estado_pago = 'anulado'
        pago.save(update_fields=['estado_pago'])
        return Response(self.get_serializer(pago).data)

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        reserva_id = request.query_params.get('reserva')
        if not reserva_id:
            return Response({'detail': 'Indica la reserva.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            reserva = Reserva.objects.select_related('cliente', 'habitacion').get(pk=reserva_id)
        except Reserva.DoesNotExist:
            return Response({'detail': 'Reserva no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        if reserva.habitacion and reserva.fecha_entrada and reserva.fecha_salida:
            noches = max((reserva.fecha_salida - reserva.fecha_entrada).days, 0)
            total = reserva.habitacion.precio * noches
        else:
            total = None

        pagado = Pago.objects.filter(reserva=reserva, estado_pago='pagado').aggregate(total=Sum('monto'))['total'] or Decimal('0.00')
        saldo = None if total is None else max(total - pagado, Decimal('0.00'))
        if total is None:
            estado_pago = 'sin_total'
        elif pagado <= 0:
            estado_pago = 'pendiente'
        elif saldo > 0:
            estado_pago = 'parcial'
        else:
            estado_pago = 'pagado'

        return Response({
            'reserva': reserva.id,
            'codigo_reserva': reserva.codigo_reserva,
            'total': total,
            'pagado': pagado,
            'saldo': saldo,
            'estado_pago': estado_pago,
        })
