from django.db import models


class Habitacion(models.Model):
    ESTADOS = [
        ('disponible', 'Disponible'),
        ('reservada', 'Reservada'),
        ('ocupada', 'Ocupada'),
        ('limpieza', 'Limpieza'),
        ('mantenimiento', 'Mantenimiento'),
    ]

    numero = models.CharField(max_length=10, unique=True)
    tipo = models.CharField(max_length=50)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='disponible')

    class Meta:
        db_table = 'habitaciones_habitacion'
        ordering = ['numero']

    def __str__(self):
        return f'Habitación {self.numero}'
