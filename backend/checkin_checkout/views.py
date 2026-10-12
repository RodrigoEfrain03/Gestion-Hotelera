from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from reservas.models import Reserva
from reservas.serializers import ReservaSerializer
from .models import CheckinCheckout
from .serializers import CheckinCheckoutSerializer


class CheckinCheckoutViewSet(viewsets.ModelViewSet):
    serializer_class = CheckinCheckoutSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = CheckinCheckout.objects.select_related(
            'reserva', 'reserva__cliente', 'reserva__habitacion'
        ).order_by('-fecha_checkin', '-id')
        estado = self.request.query_params.get('estado')
        search = self.request.query_params.get('search')
        if estado:
            qs = qs.filter(estado=estado)
        if search:
            qs = qs.filter(
                Q(reserva__codigo_reserva__icontains=search)
                | Q(reserva__nombre_cliente__icontains=search)
                | Q(reserva__cliente__nombre__icontains=search)
                | Q(reserva__cliente__ci__icontains=search)
                | Q(reserva__habitacion__numero__icontains=search)
            )
        return qs

    def create(self, request, *args, **kwargs):
        reserva_id = request.data.get('reserva')
        observaciones = (request.data.get('observaciones') or '').strip()
        if not reserva_id:
            raise ValidationError({'reserva': 'Selecciona una reserva.'})

        with transaction.atomic():
            try:
                reserva = Reserva.objects.select_for_update().select_related('habitacion').get(pk=reserva_id)
            except Reserva.DoesNotExist:
                raise ValidationError({'reserva': 'La reserva seleccionada no existe.'})

            if reserva.estado in {'cancelada', 'finalizada'}:
                raise ValidationError({'reserva': 'No se puede hacer check-in de una reserva cancelada o finalizada.'})
            if not reserva.habitacion:
                raise ValidationError({'reserva': 'La reserva no tiene una habitación asignada.'})
            if reserva.habitacion.estado == 'mantenimiento':
                raise ValidationError({'reserva': 'La habitación asignada está en mantenimiento.'})
            if reserva.habitacion.estado == 'ocupada':
                otro_activo = CheckinCheckout.objects.filter(
                    estado='hospedado', reserva__habitacion=reserva.habitacion
                ).exclude(reserva=reserva).exists()
                if otro_activo:
                    raise ValidationError({'reserva': 'La habitación ya está ocupada por otro huésped.'})

            existente = CheckinCheckout.objects.select_for_update().filter(
                reserva=reserva, estado='hospedado'
            ).first()
            if existente:
                raise ValidationError({'reserva': 'Esta reserva ya tiene un check-in activo.'})

            registro = CheckinCheckout.objects.create(
                reserva=reserva,
                fecha_checkin=timezone.now(),
                estado='hospedado',
                observaciones=observaciones,
            )
            reserva.estado = 'confirmada'
            reserva.save(update_fields=['estado'])
            reserva.habitacion.estado = 'ocupada'
            reserva.habitacion.save(update_fields=['estado'])

        serializer = self.get_serializer(registro)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        observaciones = request.data.get('observaciones')
        with transaction.atomic():
            try:
                registro = CheckinCheckout.objects.select_for_update().select_related(
                    'reserva', 'reserva__habitacion'
                ).get(pk=pk)
            except CheckinCheckout.DoesNotExist:
                return Response({'detail': 'Registro no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

            if registro.estado != 'hospedado':
                raise ValidationError({'detail': 'Solo se puede hacer check-out de un huésped hospedado.'})

            registro.fecha_checkout = timezone.now()
            registro.estado = 'finalizado'
            if observaciones is not None:
                registro.observaciones = observaciones.strip()
            registro.save(update_fields=['fecha_checkout', 'estado', 'observaciones'])

            reserva = registro.reserva
            reserva.estado = 'finalizada'
            reserva.save(update_fields=['estado'])

            if reserva.habitacion:
                reserva.habitacion.estado = 'limpieza'
                reserva.habitacion.save(update_fields=['estado'])

        return Response(self.get_serializer(registro).data)

    @action(detail=False, methods=['get'])
    def candidatos(self, request):
        qs = Reserva.objects.select_related('cliente', 'habitacion').filter(
            estado__in=['pendiente', 'confirmada'],
            habitacion__isnull=False,
        ).exclude(
            checkincheckout__estado='hospedado'
        ).order_by('fecha_entrada', 'codigo_reserva')

        search = request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(codigo_reserva__icontains=search)
                | Q(nombre_cliente__icontains=search)
                | Q(cliente__nombre__icontains=search)
                | Q(cliente__ci__icontains=search)
                | Q(habitacion__numero__icontains=search)
            )
        return Response(ReservaSerializer(qs, many=True).data)
