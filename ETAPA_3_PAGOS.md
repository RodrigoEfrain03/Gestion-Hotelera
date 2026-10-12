# Etapa 3 · Pagos completos

Esta etapa amplía la versión corregida de Check-in/Check-out y mantiene la misma base de datos existente.

## Incluye

- Registro de pagos reales contra una reserva.
- Métodos: efectivo, QR y tarjeta.
- Pagos parciales y cálculo automático del saldo pendiente.
- Prevención de pagos por encima del saldo de la reserva.
- Anulación de pagos sin borrar el historial.
- Historial de cobros con búsqueda y filtro por estado.
- Estado de pago derivado por reserva: pendiente, parcial o pagado.
- Total pagado y saldo visible también desde Reservas.
- Dashboard con ingresos cobrados reales.
- Endpoints reutilizables por una futura app móvil.

## API agregada / mejorada

- `GET /api/pagos/`
- `POST /api/pagos/`
- `PATCH /api/pagos/{id}/`
- `POST /api/pagos/{id}/anular/`
- `GET /api/pagos/resumen/?reserva={id}`

La API de reservas ahora devuelve además `total_pagado`, `saldo_pendiente` y `estado_pago`.

## Base de datos

No se agregaron columnas ni tablas. Esta etapa usa la tabla `pagos_pago` que ya existe en Supabase, por lo que no requiere una migración nueva.

## Prueba recomendada

1. Crea una reserva con habitación y fechas.
2. Entra a Pagos y registra un monto menor al total.
3. Verifica que la reserva quede con estado de pago `parcial`.
4. Registra el saldo restante.
5. Verifica que el estado pase a `pagado` y el saldo a `0.00`.
6. Anula uno de los pagos y verifica que el saldo se recalcule.
7. Comprueba que el Dashboard muestre los ingresos cobrados.
