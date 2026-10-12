# App móvil — Etapa M2: Reservas

Esta etapa amplía la app Expo/React Native para que el módulo **Reservas** ya sea funcional contra el mismo backend Django y la misma base Supabase del sistema web.

## Incluye

- Login JWT y sesión persistente.
- Dashboard móvil conectado a `/api/dashboard/`.
- Listado real de reservas.
- Búsqueda por código, huésped, CI o habitación.
- Filtros por estado.
- Detalle completo de una reserva.
- Creación de reserva desde el teléfono.
- Selección de cliente existente.
- Selector de fecha de entrada/salida.
- Consulta real de disponibilidad antes de mostrar habitaciones.
- Validaciones y mensajes del backend.
- Navegación preparada para M3 (clientes, habitaciones y check-in/check-out) y M4 (pagos).

## Configuración de red

1. PC y teléfono deben estar en la misma Wi-Fi.
2. En Windows ejecuta `ipconfig` y toma la IPv4 del adaptador Wi-Fi.
3. En `backend/.env` agrega esa IP a `ALLOWED_HOSTS`.
4. Arranca Django con:

```powershell
python manage.py runserver 0.0.0.0:8000
```

5. Copia `mobile/.env.example` a `mobile/.env` y cambia la URL:

```env
EXPO_PUBLIC_API_URL=http://TU_IP:8000/api
```

## Ejecutar app

```powershell
cd mobile
npm install
npx expo start
```

Abre el QR con Expo Go.

## Prueba recomendada

1. Inicia sesión.
2. Entra a Reservas.
3. Pulsa **+ Nueva**.
4. Elige un cliente.
5. Selecciona fechas.
6. La app consulta `/api/reservas/disponibilidad/` y solo muestra habitaciones libres.
7. Elige habitación y cantidad de personas.
8. Guarda.
9. La app abre automáticamente el detalle de la nueva reserva.
10. Comprueba en la web o Supabase que la reserva existe.
