from django.db import models


class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    ci = models.CharField(max_length=30)
    telefono = models.CharField(max_length=30)
    correo = models.EmailField(max_length=254)

    class Meta:
        db_table = 'clientes_cliente'
        ordering = ['nombre']

    def __str__(self):
        return f'{self.nombre} ({self.ci})'
