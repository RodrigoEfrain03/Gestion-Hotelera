from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('clientes', '0001_existing_table'),
        ('habitaciones', '0001_existing_table'),
        ('reservas', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='reserva',
            name='cliente',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reservas',
                to='clientes.cliente',
            ),
        ),
        migrations.AddField(
            model_name='reserva',
            name='habitacion',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reservas',
                to='habitaciones.habitacion',
            ),
        ),
        migrations.AlterModelOptions(
            name='reserva',
            options={'ordering': ['-fecha_creacion']},
        ),
    ]
