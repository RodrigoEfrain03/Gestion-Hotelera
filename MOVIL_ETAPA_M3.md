# Etapa móvil M3 — Clientes, habitaciones y check-in/check-out

Esta etapa parte de M2 y mantiene login, sesión JWT, dashboard y reservas.

## Nuevo en M3
- Clientes: listado, búsqueda, alta y edición.
- Habitaciones: listado, alta, edición, tarifa y estado.
- Check-in: lista de reservas candidatas y confirmación de ingreso.
- Hospedados: listado de check-ins activos.
- Check-out: confirmación de salida y cambio de habitación a limpieza.
- Historial de check-outs.
- Menú Más con acceso a Clientes y Habitaciones.
- Iconos reales en la barra inferior con Ionicons.
- Proyecto móvil actualizado para Expo SDK 57.

## Ejecutar
Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
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

Revisa `mobile/.env` y usa la IPv4 actual del equipo:
`EXPO_PUBLIC_API_URL=http://TU_IP:8000/api`
