from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from checkin_checkout.models import CheckinCheckout
from habitaciones.models import Habitacion
from pagos.models import Pago
from reservas.models import Reserva


def _money(value):
    value = value or Decimal('0.00')
    return f"{Decimal(value):.2f}"


@api_view(['GET'])
def dashboard_summary(request):
    """Resumen operativo del hotel para web y futuras apps móviles."""
    today = timezone.localdate()
    now = timezone.now()
    week_start = today - timedelta(days=6)
    month_start = today.replace(day=1)

    habitaciones = Habitacion.objects.all()
    total_habitaciones = habitaciones.count()
    room_rows = habitaciones.values('estado').annotate(total=Count('id'))
    room_counts = {row['estado']: row['total'] for row in room_rows}
    ocupadas = room_counts.get('ocupada', 0)
    ocupacion_pct = round((ocupadas / total_habitaciones * 100), 1) if total_habitaciones else 0

    reservas_base = Reserva.objects.select_related('cliente', 'habitacion')
    reservas_hoy = reservas_base.filter(fecha_entrada=today).exclude(estado='cancelada')
    salidas_hoy = reservas_base.filter(fecha_salida=today).exclude(estado='cancelada')
    reservas_activas = reservas_base.filter(estado__in=['pendiente', 'confirmada']).count()

    checkins_hoy = CheckinCheckout.objects.filter(fecha_checkin__date=today).count()
    checkouts_hoy = CheckinCheckout.objects.filter(fecha_checkout__date=today).count()
    hospedados = CheckinCheckout.objects.filter(estado='hospedado').count()

    checkins_pendientes = reservas_hoy.filter(
        estado__in=['pendiente', 'confirmada'], habitacion__isnull=False
    ).exclude(checkincheckout__estado='hospedado').count()

    pagos_validos = Pago.objects.filter(estado_pago='pagado')
    ingreso_hoy = pagos_validos.filter(fecha_pago__date=today).aggregate(total=Sum('monto'))['total'] or Decimal('0.00')
    ingreso_semana = pagos_validos.filter(fecha_pago__date__gte=week_start, fecha_pago__date__lte=today).aggregate(total=Sum('monto'))['total'] or Decimal('0.00')
    ingreso_mes = pagos_validos.filter(fecha_pago__date__gte=month_start, fecha_pago__date__lte=today).aggregate(total=Sum('monto'))['total'] or Decimal('0.00')

    ingresos_por_dia_qs = pagos_validos.filter(
        fecha_pago__date__gte=week_start,
        fecha_pago__date__lte=today,
    ).annotate(dia=TruncDate('fecha_pago')).values('dia').annotate(total=Sum('monto')).order_by('dia')
    ingresos_map = {row['dia']: row['total'] for row in ingresos_por_dia_qs}
    ingresos_7_dias = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        ingresos_7_dias.append({
            'fecha': day.isoformat(),
            'etiqueta': day.strftime('%d/%m'),
            'total': _money(ingresos_map.get(day, Decimal('0.00'))),
        })

    proximas_llegadas = reservas_base.filter(
        fecha_entrada__gte=today,
        estado__in=['pendiente', 'confirmada'],
    ).order_by('fecha_entrada', 'codigo_reserva')[:6]
    llegadas = [{
        'id': r.id,
        'codigo_reserva': r.codigo_reserva,
        'cliente': r.cliente.nombre if r.cliente else r.nombre_cliente,
        'habitacion': r.habitacion.numero if r.habitacion else None,
        'fecha_entrada': r.fecha_entrada.isoformat(),
        'estado': r.estado,
    } for r in proximas_llegadas]

    pendientes_salida = CheckinCheckout.objects.select_related(
        'reserva', 'reserva__cliente', 'reserva__habitacion'
    ).filter(
        estado='hospedado', reserva__fecha_salida__lte=today
    ).order_by('reserva__fecha_salida')[:6]
    salidas = [{
        'id': c.id,
        'codigo_reserva': c.reserva.codigo_reserva,
        'cliente': c.reserva.cliente.nombre if c.reserva.cliente else c.reserva.nombre_cliente,
        'habitacion': c.reserva.habitacion.numero if c.reserva.habitacion else None,
        'fecha_salida': c.reserva.fecha_salida.isoformat(),
        'atrasado': c.reserva.fecha_salida < today,
    } for c in pendientes_salida]

    # Actividad reciente: combina reservas, pagos y movimientos de recepción.
    activity = []
    for r in reservas_base.order_by('-fecha_creacion')[:5]:
        activity.append({
            'tipo': 'reserva',
            'titulo': f'Reserva {r.codigo_reserva}',
            'detalle': r.cliente.nombre if r.cliente else r.nombre_cliente,
            'fecha': r.fecha_creacion.isoformat(),
        })
    for p in Pago.objects.select_related('reserva').order_by('-fecha_pago')[:5]:
        activity.append({
            'tipo': 'pago',
            'titulo': f'Pago Bs {_money(p.monto)}',
            'detalle': f'{p.reserva.codigo_reserva} · {p.metodo_pago}',
            'fecha': p.fecha_pago.isoformat(),
        })
    movimientos = CheckinCheckout.objects.select_related('reserva').order_by('-id')[:5]
    for c in movimientos:
        event_date = c.fecha_checkout or c.fecha_checkin
        if event_date:
            activity.append({
                'tipo': 'checkout' if c.fecha_checkout else 'checkin',
                'titulo': 'Check-out registrado' if c.fecha_checkout else 'Check-in registrado',
                'detalle': c.reserva.codigo_reserva,
                'fecha': event_date.isoformat(),
            })
    activity.sort(key=lambda item: item['fecha'], reverse=True)
    activity = activity[:8]

    return Response({
        'generado_en': now.isoformat(),
        'fecha': today.isoformat(),
        'metricas': {
            'habitaciones_total': total_habitaciones,
            'habitaciones_disponibles': room_counts.get('disponible', 0),
            'habitaciones_ocupadas': ocupadas,
            'ocupacion_porcentaje': ocupacion_pct,
            'reservas_activas': reservas_activas,
            'llegadas_hoy': reservas_hoy.count(),
            'checkins_pendientes_hoy': checkins_pendientes,
            'salidas_hoy': salidas_hoy.count(),
            'checkins_hoy': checkins_hoy,
            'checkouts_hoy': checkouts_hoy,
            'huespedes_hospedados': hospedados,
            'ingreso_hoy': _money(ingreso_hoy),
            'ingreso_semana': _money(ingreso_semana),
            'ingreso_mes': _money(ingreso_mes),
        },
        'habitaciones_por_estado': {
            estado: room_counts.get(estado, 0)
            for estado in ['disponible', 'reservada', 'ocupada', 'limpieza', 'mantenimiento']
        },
        'ingresos_7_dias': ingresos_7_dias,
        'proximas_llegadas': llegadas,
        'salidas_pendientes': salidas,
        'actividad_reciente': activity,
    })
