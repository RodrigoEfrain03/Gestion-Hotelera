# Etapa 6 — Autenticación, usuarios y roles

## Qué se agregó
- Login con JWT (`/api/auth/login/`).
- Renovación de token (`/api/auth/refresh/`).
- Usuario actual (`/api/auth/me/`).
- Protección global de la API: por defecto se exige autenticación.
- Roles: **Administrador** y **Recepción**.
- Módulo de **Usuarios** visible solo para Administrador.
- Administrador puede crear, editar, activar/desactivar y eliminar usuarios.
- Recepción puede operar clientes, habitaciones, reservas, check-in/check-out y registrar pagos.
- Solo Administrador puede eliminar clientes/habitaciones/reservas y anular pagos.
- Rutas React protegidas y cierre de sesión.
- La API JWT queda reutilizable para la futura app móvil.
- Se preservó el nombre visual **Hotel Marriott Yacuiba** según el último diseño mostrado.

## Primera ejecución
1. Copia tu `backend/.env` al proyecto.
2. Crea/activa el entorno virtual e instala dependencias:

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
```

3. Si todavía no tienes un usuario administrador cuya contraseña recuerdes, crea uno:

```powershell
python manage.py createsuperuser
```

Este comando usa la tabla `auth_user` que ya existe. No crea nuevas tablas del hotel.

4. Inicia Django:

```powershell
python manage.py runserver
```

5. En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

6. Abre `http://localhost:5173` e inicia sesión con el superusuario.

## Flujo de prueba
1. Inicia sesión como administrador.
2. Entra en **Usuarios** y crea un usuario con rol Recepción.
3. Cierra sesión.
4. Ingresa con el usuario Recepción.
5. Verifica que no aparezca el módulo Usuarios y que no aparezcan las acciones destructivas reservadas al administrador.
6. Comprueba que reservas, check-in/check-out y registro de pagos sigan funcionando.

## Base de datos
Esta etapa no necesita un modelo nuevo. Reutiliza `auth_user`, `auth_group` y las tablas de permisos de Django que ya existen en Supabase.
