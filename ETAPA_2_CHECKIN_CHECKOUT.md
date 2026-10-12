# Etapa 2 — Check-in / Check-out

Esta etapa se construye sobre la Etapa 1 y no agrega columnas ni tablas nuevas.

## Flujo implementado

- Lista movimientos reales desde Django/Supabase.
- Muestra reservas candidatas para check-in.
- Al hacer check-in:
  - crea el registro `checkin_checkout_checkincheckout`;
  - registra fecha/hora actual;
  - cambia el estado del check-in a `hospedado`;
  - deja la reserva en `confirmada`;
  - cambia la habitación a `ocupada`.
- Evita check-in duplicado para una misma reserva.
- Rechaza reservas canceladas/finalizadas, sin habitación o con habitación en mantenimiento.
- Evita ocupar una habitación que tenga otro huésped activo.
- Al hacer check-out:
  - registra fecha/hora de salida;
  - cambia el registro a `finalizado`;
  - cambia la reserva a `finalizada`;
  - cambia la habitación a `limpieza`.
- Incluye filtros, buscador, observaciones y métricas operativas.
- La lógica crítica vive en Django para que la futura app móvil reutilice la misma API.

## Endpoints añadidos / usados

- `GET /api/checkins/`
- `POST /api/checkins/`
- `GET /api/checkins/candidatos/`
- `POST /api/checkins/{id}/checkout/`

## Base de datos

No requiere `makemigrations` ni `migrate` porque utiliza la tabla de check-in/check-out existente.

## Para probar

1. Copia tu `backend/.env` desde la versión que ya funciona.
2. Inicia Django y React.
3. Crea o utiliza una reserva pendiente/confirmada con habitación asignada.
4. Entra a Check-in / Check-out y registra el check-in.
5. Confirma en Habitaciones que queda `ocupada`.
6. Realiza el check-out.
7. Confirma que la reserva queda `finalizada` y la habitación `limpieza`.
