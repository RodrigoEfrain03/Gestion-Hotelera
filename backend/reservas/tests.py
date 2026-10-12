from datetime import date
from django.test import TestCase
from clientes.models import Cliente
from habitaciones.models import Habitacion
from .models import Reserva
from .serializers import ReservaSerializer


class ReservaSerializerTests(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(nombre='Ana', ci='1', telefono='70000000', correo='ana@test.com')
        self.habitacion = Habitacion.objects.create(numero='101', tipo='Simple', precio=100, estado='disponible')

    def test_rechaza_fechas_invalidas(self):
        s = ReservaSerializer(data={'cliente':self.cliente.id,'habitacion':self.habitacion.id,'fecha_entrada':'2026-10-10','fecha_salida':'2026-10-10','cantidad_personas':1,'estado':'pendiente'})
        self.assertFalse(s.is_valid())

    def test_rechaza_solapamiento(self):
        Reserva.objects.create(codigo_reserva='RES-A', nombre_cliente='Ana', cliente=self.cliente, habitacion=self.habitacion, fecha_entrada=date(2026,10,10), fecha_salida=date(2026,10,15), cantidad_personas=1, estado='confirmada')
        s = ReservaSerializer(data={'cliente':self.cliente.id,'habitacion':self.habitacion.id,'fecha_entrada':'2026-10-12','fecha_salida':'2026-10-14','cantidad_personas':1,'estado':'pendiente'})
        self.assertFalse(s.is_valid())
        self.assertIn('habitacion', s.errors)
