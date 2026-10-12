
from django.db import models
from reservas.models import Reserva


class Pago(models.Model):

    METODOS = [
        ('efectivo', 'Efectivo'),
        ('qr', 'QR'),
        ('tarjeta', 'Tarjeta'),
    ]

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('anulado', 'Anulado'),
    ]

    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE
    )

    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    metodo_pago = models.CharField(
        max_length=20,
        choices=METODOS,
        default='efectivo'
    )

    estado_pago = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente'
    )

    fecha_pago = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return f"Pago {self.reserva.codigo_reserva}"
# Create your models here.
