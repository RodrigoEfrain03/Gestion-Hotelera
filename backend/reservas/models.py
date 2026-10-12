from django.db import models
from clientes.models import Cliente
from habitaciones.models import Habitacion


class Reserva(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('finalizada', 'Finalizada'),
    ]

    codigo_reserva = models.CharField(max_length=20, unique=True)

    # Se conserva por compatibilidad con los datos existentes en Supabase.
    nombre_cliente = models.CharField(max_length=100)

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas',
    )

    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas',
    )

    fecha_entrada = models.DateField()
    fecha_salida = models.DateField()
    cantidad_personas = models.IntegerField(default=1)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_creacion']

    def __str__(self):
        return self.codigo_reserva
