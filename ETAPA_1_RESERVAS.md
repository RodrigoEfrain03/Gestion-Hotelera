# Etapa 1 — Reservas completas

Esta entrega cierra el módulo de reservas del MVP.

## Incluye
- Crear reservas con código automático generado por Django.
- Editar reservas existentes.
- Cancelar/finalizar mediante estado.
- Eliminar con confirmación.
- Buscar y filtrar en frontend.
- Consultar disponibilidad real por rango de fechas.
- Evitar solapamientos de una misma habitación desde el backend.
- Bloquear habitaciones en mantenimiento.
- Validar fechas y cantidad de personas.
- Calcular noches y total estimado desde la API.
- Endpoint reutilizable por futura app móvil: `GET /api/reservas/disponibilidad/`.

## No requiere migraciones nuevas
Esta etapa no cambia el esquema de Supabase.

## Arranque
Backend (con `backend/.env` configurado):
`venv\\Scripts\\activate`
`$env:Path += ";C:\\Program Files\\PostgreSQL\\18\\bin"`
`python manage.py runserver`

Frontend:
`npm install`
`npm run dev`
