from django.test import TestCase
from rest_framework.test import APIClient
from clientes.models import Cliente
from habitaciones.models import Habitacion
from reservas.models import Reserva
from .models import CheckinCheckout


class CheckinCheckoutFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cliente = Cliente.objects.create(nombre='Ana Pérez', ci='123', telefono='70000000', correo='ana@example.com')
        self.habitacion = Habitacion.objects.create(numero='101', tipo='Simple', precio='200.00', estado='disponible')
        self.reserva = Reserva.objects.create(
            codigo_reserva='RES-TEST01', nombre_cliente=self.cliente.nombre, cliente=self.cliente,
            habitacion=self.habitacion, fecha_entrada='2026-10-05', fecha_salida='2026-10-07',
            cantidad_personas=1, estado='confirmada'
        )

    def test_checkin_and_checkout_update_related_states(self):
        response = self.client.post('/api/checkins/', {'reserva': self.reserva.id, 'observaciones': 'Sin novedades'}, format='json')
        self.assertEqual(response.status_code, 201)
        registro = CheckinCheckout.objects.get(reserva=self.reserva)
        self.reserva.refresh_from_db(); self.habitacion.refresh_from_db()
        self.assertEqual(registro.estado, 'hospedado')
        self.assertEqual(self.habitacion.estado, 'ocupada')

        response = self.client.post(f'/api/checkins/{registro.id}/checkout/', {'observaciones': 'Salida normal'}, format='json')
        self.assertEqual(response.status_code, 200)
        registro.refresh_from_db(); self.reserva.refresh_from_db(); self.habitacion.refresh_from_db()
        self.assertEqual(registro.estado, 'finalizado')
        self.assertEqual(self.reserva.estado, 'finalizada')
        self.assertEqual(self.habitacion.estado, 'limpieza')

    def test_duplicate_active_checkin_is_rejected(self):
        first = self.client.post('/api/checkins/', {'reserva': self.reserva.id}, format='json')
        self.assertEqual(first.status_code, 201)
        second = self.client.post('/api/checkins/', {'reserva': self.reserva.id}, format='json')
        self.assertEqual(second.status_code, 400)
