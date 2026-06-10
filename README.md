# DAW-TeamW-Practices — TFI: Sistema de Gestión de Proyectos

Trabajo Final Integrador — Desarrollo de Aplicaciones Web 2026.
Sistema simple de gestión de proyectos según `Consignas.pdf` de la cátedra.

## Stack

- **Backend:** NestJS + TypeORM + PostgreSQL (JWT, bcrypt, Swagger, Helmet)
- **Frontend:** Angular 21 + PrimeNG
- **Deploy:** nginx (sirve el frontend y proxya `/api`) + PM2 (proceso del backend)

## Estructura

```
backend/    API REST NestJS (puerto 3000, prefijo global /api)
frontend/   SPA Angular (dev en 4200, con proxy /api -> 3000)
db/         Script_BD.sql de la cátedra
deploy/     nginx.conf + ecosystem.config.js (PM2)
manage.py   Orquestador de todo el proyecto
```

## Puesta en marcha rápida (manage.py)

Requiere Python 3, Node.js, PostgreSQL y PM2 (`npm install -g pm2`).
nginx se detecta en `NGINX_HOME`, `C:\nginx*` o se descarga en `deploy/` durante el setup.

```
python manage.py setup    # npm install (backend y frontend), nginx, backend/.env
python manage.py db       # crea rol "Equipo-W" + base tfi y ejecuta db/Script_BD.sql
python manage.py dev      # desarrollo: backend (:3000) + frontend (:4200)
python manage.py start    # producción: build (si falta) + PM2 + nginx en :8080
python manage.py stop     # detiene PM2 y nginx
python manage.py status   # estado de PM2 y puertos
python manage.py logs     # logs del backend en PM2
```

- `manage.py db` pide la clave del usuario `postgres` (o usa `--password` / `PGPASSWORD`).
- La app **no** se conecta como `postgres`: usa el rol `Equipo-W` / `equipow` sobre la base `tfi`.

## Puesta en marcha manual

### 1. Base de datos (PostgreSQL)

```sql
CREATE ROLE "Equipo-W" WITH LOGIN PASSWORD 'equipow';
CREATE DATABASE tfi OWNER "Equipo-W";
```

Luego ejecutar el script de la cátedra sobre la base `tfi`:

```
psql -U "Equipo-W" -h localhost -d tfi -f db/Script_BD.sql
```

### 2. Backend

```
cd backend
copy .env.example .env   # ajustar credenciales si difieren
npm install
npm run start:dev
```

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs

### 3. Frontend (desarrollo)

```
cd frontend
npm install
npm start
```

- App: http://localhost:4200 (las llamadas a `/api` se proxyan al backend vía `proxy.conf.json`)
- Credenciales de prueba (creadas por el script de BD): **usuario** / **clave**

## Despliegue (nginx + PM2)

`python manage.py start` compila ambos proyectos (si hace falta), levanta el backend
con PM2 (`deploy/ecosystem.config.js`) y arranca nginx con `deploy/nginx.conf`:

- App desplegada: **http://localhost:8080**
- nginx sirve `frontend/dist/frontend/browser` y proxya `/api/` a `127.0.0.1:3000`
- Rutas del SPA caen en `index.html` (`try_files`)

## Funcionalidades (consignas base)

- **Acceso:** login con usuario/clave (JWT). Solo usuarios en estado ACTIVO.
- **Proyectos:** crear, modificar, ver detalle con sus tareas y cliente. Estados: ACTIVO / FINALIZADO / BAJA.
- **Clientes:** crear y modificar (también desde el alta/edición de un proyecto); solo clientes ACTIVOS son asignables a proyectos; un proyecto puede no tener cliente (interno). No se puede dar de baja un cliente registrado en proyectos.
- **Tareas:** agregar, modificar y eliminar (baja lógica) dentro de un proyecto. Estados: PENDIENTE / FINALIZADA / BAJA.
- **Visibilidad:** todos los usuarios ven todos los registros (sin propiedad por usuario).

## Endpoints principales

Prefijo global: `/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login, devuelve `access_token` |
| GET/POST | `/api/clientes` | Listar (filtro `?estado=`) / crear |
| PATCH | `/api/clientes/:id` | Modificar nombre/estado |
| GET/POST | `/api/proyectos` | Listar / crear |
| GET | `/api/proyectos/:id` | Detalle con tareas y cliente |
| PATCH | `/api/proyectos/:id` | Modificar nombre/estado/cliente |
| POST | `/api/tareas` | Crear tarea en un proyecto |
| PATCH | `/api/tareas/:id` | Modificar descripción/estado |
| DELETE | `/api/tareas/:id` | Eliminar (baja lógica) |

Todos los endpoints (salvo login) requieren header `Authorization: Bearer <token>`.
