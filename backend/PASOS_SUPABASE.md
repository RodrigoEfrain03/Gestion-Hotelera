# Preparar Django para Supabase

Esta versión conserva las tablas que ya existen en Supabase y agrega a `reservas_reserva` dos relaciones opcionales:

- `cliente_id` -> `clientes_cliente.id`
- `habitacion_id` -> `habitaciones_habitacion.id`

`nombre_cliente` se mantiene por compatibilidad y para no perder datos existentes.

## 1. Crear el entorno virtual e instalar dependencias

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Crear `.env`

Copia `.env.example` a `.env` y llena SOLO los datos de conexión de Supabase.

No compartas `DB_PASSWORD` ni subas `.env` a Git.

## 3. Antes de migrar, comprobar la conexión

```powershell
python manage.py check
python manage.py showmigrations
```

Las migraciones `clientes/0001_existing_table` y `habitaciones/0001_existing_table` son solo de estado: registran en Django tablas que ya existen y no intentan recrearlas en Supabase.

## 4. Aplicar el cambio seguro a Reserva

```powershell
python manage.py migrate
```

La migración `reservas/0002_cliente_habitacion.py` agrega columnas nullable, por lo que las reservas existentes no se eliminan ni necesitan cliente/habitación de inmediato.

## 5. Arrancar API

```powershell
python manage.py runserver
```

Endpoints principales:

- `/api/clientes/`
- `/api/habitaciones/`
- `/api/reservas/`
- `/api/pagos/`
- `/api/checkins/` (según router existente)

## Validaciones nuevas

La API de reservas ahora impide:

- fecha de salida igual o anterior a la entrada;
- menos de una persona;
- doble reserva de la misma habitación cuando las fechas se solapan y la reserva está pendiente/confirmada.

Si se selecciona un cliente, `nombre_cliente` se sincroniza automáticamente con su nombre.
