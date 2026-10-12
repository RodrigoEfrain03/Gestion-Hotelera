# Etapa 6.1 — Roles automáticos y permisos

Esta etapa automatiza los roles del sistema hotelero.

## Roles

### Administrador
- Acceso a todos los módulos.
- Gestión de usuarios y roles.
- Puede eliminar clientes, habitaciones y reservas.
- Puede anular pagos.
- Tiene permisos completos sobre los modelos del hotel.

### Recepción
- Dashboard.
- Clientes.
- Habitaciones.
- Reservas.
- Check-in / Check-out.
- Pagos.
- Puede crear y modificar datos operativos.
- No puede administrar usuarios.
- No puede eliminar registros sensibles.
- No puede anular pagos.

## Configuración automática

Después de instalar dependencias y conectar Supabase, ejecutar:

```powershell
python manage.py setup_roles --assign-superusers
```

El comando es idempotente: se puede ejecutar varias veces sin duplicar grupos.

También se ejecuta automáticamente después de `python manage.py migrate` mediante `post_migrate`.

## Crear recepcionista

Entrar con un Administrador al módulo **Usuarios** y seleccionar el rol **Recepción** al crear el usuario.

No hace falta crear tablas nuevas ni migraciones hoteleras adicionales.
