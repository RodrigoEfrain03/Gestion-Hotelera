
from django.db import models
from reservas.models import Reserva


class CheckinCheckout(models.Model):

    ESTADOS = [
        ('reservado', 'Reservado'),
        ('hospedado', 'Hospedado'),
        ('finalizado', 'Finalizado'),
    ]

    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE
    )

    fecha_checkin = models.DateTimeField(
        null=True,
        blank=True
    )

    fecha_checkout = models.DateTimeField(
        null=True,
        blank=True
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='reservado'
    )

    observaciones = models.TextField(
        blank=True
    )


    def __str__(self):
        return f"Check-in {self.reserva.codigo_reserva}"
# Create your models here.
