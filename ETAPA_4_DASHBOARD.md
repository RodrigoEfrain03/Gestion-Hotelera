# Etapa 4 · Dashboard real y métricas hoteleras

Esta etapa reemplaza el dashboard basado en múltiples llamadas y datos parciales por un endpoint agregado pensado para web y una futura app móvil.

## Backend
- `GET /api/dashboard/`
- Métricas de habitaciones, ocupación, reservas activas, llegadas y salidas del día.
- Check-ins pendientes y huéspedes actualmente hospedados.
- Ingresos cobrados hoy, últimos 7 días y mes actual.
- Serie diaria de ingresos de los últimos 7 días.
- Próximas llegadas y salidas pendientes.
- Actividad reciente combinando reservas, pagos, check-ins y check-outs.

## Frontend
- 6 tarjetas con KPIs reales.
- Gráfico de ingresos de 7 días.
- Ocupación y estados de habitaciones.
- Próximas llegadas.
- Salidas pendientes.
- Actividad reciente.
- Acciones rápidas y botón de actualización.

## Base de datos
No requiere migraciones nuevas.
