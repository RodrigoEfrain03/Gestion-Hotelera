# Etapa móvil M4 — Pagos

Esta etapa parte de M3 y habilita el módulo **Pagos** en la aplicación móvil.

## Funcionalidades
- Listado de reservas con estado de pago.
- Búsqueda por código, huésped, CI y habitación.
- Filtros: todos, pendientes, parciales y pagados.
- Resumen visual de cobrado y saldo por cobrar.
- Detalle de pago por reserva.
- Total de estadía, total pagado y saldo pendiente.
- Registro de pagos parciales o del saldo completo.
- Métodos: efectivo, QR y tarjeta.
- Historial de pagos por reserva.
- Anulación de pagos solo para rol Administrador.
- Los pagos anulados no se borran del historial.
- La lógica y validación siguen centralizadas en la API Django.

## Puesta en marcha
Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
python manage.py runserver 0.0.0.0:8000
```

Móvil:
```powershell
cd mobile
npm install
npx expo-doctor@latest
npx expo start -c
```

Verifica `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://IP-DE-TU-PC:8000/api
```

También asegúrate de que la misma IP esté incluida en `backend/.env` dentro de `ALLOWED_HOSTS`.
