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
                    name='Cliente',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('nombre', models.CharField(max_length=100)),
                        ('ci', models.CharField(max_length=30)),
                        ('telefono', models.CharField(max_length=30)),
                        ('correo', models.EmailField(max_length=254)),
                    ],
                    options={
                        'db_table': 'clientes_cliente',
                        'ordering': ['nombre'],
                    },
                ),
            ],
        ),
    ]
