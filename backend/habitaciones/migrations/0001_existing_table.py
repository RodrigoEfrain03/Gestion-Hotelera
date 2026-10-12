from django.db import migrations, models


class Migration(migrations.Migration):
    """Registra en Django una tabla que ya existe en Supabase sin recrearla."""

    initial = True

    dependencies = []

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name='Habitacion',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('numero', models.CharField(max_length=10, unique=True)),
                        ('tipo', models.CharField(max_length=50)),
                        ('precio', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('estado', models.CharField(choices=[('disponible', 'Disponible'), ('reservada', 'Reservada'), ('ocupada', 'Ocupada'), ('limpieza', 'Limpieza'), ('mantenimiento', 'Mantenimiento')], default='disponible', max_length=20)),
                    ],
                    options={
                        'db_table': 'habitaciones_habitacion',
                        'ordering': ['numero'],
                    },
                ),
            ],
        ),
    ]
