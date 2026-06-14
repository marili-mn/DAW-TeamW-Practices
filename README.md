# Sistema de Gestión de Proyectos — TFI DAW 2026

Trabajo Final Integrador · Tecnicatura Universitaria en Desarrollo Web · Team W

## Stack

| Capa | Tecnología |
|---|---|
| Backend | NestJS 11 · TypeORM · PostgreSQL 18 |
| Frontend | Angular 21 · PrimeNG · Standalone components |
| Deploy | nginx 1.30.2 · PM2 7.0.1 |
| Orquestador | Python 3 (`manage.py`) |

## Funcionalidades implementadas

### Base (consigna obligatoria)

- **Login con JWT** — autenticación por usuario/clave, guard global en todos los endpoints protegidos
- **Proyectos** — crear, editar, ver detalle con tareas y cliente; estados ACTIVO / FINALIZADO / BAJA
- **Clientes** — crear y editar; solo clientes ACTIVO son asignables; baja bloqueada si tiene proyectos; proyectos sin cliente (internos) soportados
- **Tareas** — agregar, editar y eliminar dentro de un proyecto; estados PENDIENTE / FINALIZADA / BAJA
- **Visibilidad global** — todos los usuarios ven todos los registros (sin propiedad por usuario)

### Extensiones implementadas (8)

| # | Feature | Responsable |
|---|---|---|
| 1 | **Historial de cambios** — interceptor global NestJS que registra cada mutación (entidad, acción, usuario, fecha) en tabla `historial` | Javier |
| 2 | **Datos de contacto de clientes** — campos `telefono` y `email` opcionales, visibles en tabla y formulario | Denise |
| 3 | **CRUD de Usuarios** — crear, editar nombre/clave/rol, dar de baja y reactivar desde la UI | Juli |
| 4 | **Roles ADMIN / ESTANDAR** — rol en JWT; secciones Usuarios e Historial restringidas a ADMIN; guard en backend + ocultamiento en frontend | Nahuel |
| 5 | **Búsqueda avanzada server-side** — filtros por nombre, estado y cliente; orden por cualquier columna; paginado configurable (QueryBuilder) | Nahuel |
| 6 | **Fecha de finalización con detección de ATRASADO** — campo `fecha_fin` en proyectos; badge automático cuando la fecha ya pasó | Mai |
| 7 | **Exportación CSV** — proyectos y clientes descargables como archivo CSV desde la UI | Mai |
| 8 | **Dashboard de estadísticas** — cards de totales (proyectos, tareas, clientes), distribución por estado, ranking de clientes con más proyectos, contador de atrasados | Mai / Nahuel |
| 9 | **Vista Kanban** — tablero drag & drop en el detalle de proyecto; columnas por estado; actualiza en BD al soltar | Nahuel |

> Las contraseñas se almacenan con bcrypt. El hash **nunca** se expone en respuestas de la API.

## Puesta en marcha rápida

### Prerequisitos

- Node.js 20+
- PostgreSQL 18 en `localhost:5432`
- Python 3.11+
- PM2 global: `npm install -g pm2`
- nginx (se detecta en `NGINX_HOME`, `C:\nginx*` o se descarga automáticamente)

### Primer uso

```bash
# 1. Instalar dependencias npm y configurar nginx
python manage.py setup

# 2. Crear rol/base de datos y ejecutar el schema
python manage.py db

# 3. Cargar datos de demostración (opcional)
python manage.py seed

# 4. Levantar en producción (PM2 + nginx en :8080)
python manage.py start
```

La aplicación queda en `http://localhost:8080`.

### Desarrollo local

```bash
python manage.py dev   # backend watch :3000 + frontend ng serve :4200
```

### Todos los comandos

```
python manage.py setup    Instala dependencias y descarga nginx si hace falta
python manage.py db       Crea rol "Equipo-W", base "tfi" y aplica el schema SQL
python manage.py seed     Carga datos de demostración temáticos (NASA, SpaceX, FIFA…)
python manage.py dev      Backend + frontend en modo desarrollo
python manage.py build    Compila backend y frontend para producción
python manage.py start    Despliegue: PM2 (backend) + nginx (frontend + proxy)
python manage.py stop     Detiene PM2 y nginx
python manage.py status   Estado de DB, nginx, PM2 y puertos con URLs
python manage.py logs     Logs del backend en tiempo real (PM2)
```

## Credenciales por defecto

| Dato | Valor |
|---|---|
| Usuario de la app | `usuario` |
| Contraseña | `clave` |
| Rol | ADMIN |
| DB host | `localhost:5432` |
| DB name | `tfi` |
| DB user | `Equipo-W` |

> `manage.py db` pide la clave del superusuario `postgres` para crear el rol y la base.  
> La app se conecta como `Equipo-W`, no como `postgres`.

## Estructura del proyecto

```
DAW-TeamW-Practices/
├── backend/
│   └── src/
│       ├── auth/              JWT, guards, decoradores de roles
│       ├── usuarios/          CRUD de usuarios
│       ├── clientes/          CRUD de clientes (con contacto + CSV export)
│       ├── proyectos/         CRUD paginado + fecha fin + CSV export
│       ├── tareas/            CRUD de tareas
│       ├── historial/         Interceptor de auditoría + endpoint GET
│       └── estadisticas/      Endpoint de métricas del dashboard
├── frontend/
│   └── src/app/
│       ├── core/              ApiService, AuthService, modelos, guards
│       ├── pages/             clientes/, proyectos/, proyecto-detalle/,
│       │                      estadisticas/, historial/, usuarios/
│       └── shared/            Componentes reutilizables
├── db/
│   ├── Script_BD.sql          Schema completo (ENUMs, tablas, FKs, usuario inicial)
│   └── seed-demo.sql          Datos de demo: NASA, SpaceX, Stark Industries, FIFA, ESA…
├── deploy/
│   ├── nginx.conf             Sirve frontend en :8080, proxy /api → :3000
│   └── ecosystem.config.js    PM2 — proceso tfi-backend
└── manage.py                  Orquestador Python
```

## Schema de base de datos

El schema base es el `Script_BD.sql` de la cátedra. Las extensiones del equipo agregan:

**`clientes`** — datos de contacto:
```sql
ALTER TABLE clientes ADD COLUMN telefono TEXT;
ALTER TABLE clientes ADD COLUMN email TEXT;
```

**`usuarios`** — rol:
```sql
CREATE TYPE roles_usuarios AS ENUM ('ADMIN', 'ESTANDAR');
ALTER TABLE usuarios ADD COLUMN rol roles_usuarios NOT NULL DEFAULT 'ESTANDAR';
```

**`proyectos`** — fecha de finalización:
```sql
ALTER TABLE proyectos ADD COLUMN fecha_fin DATE;
```

**`historial`** — nueva tabla de auditoría:
```sql
CREATE TABLE historial (
    id        SERIAL PRIMARY KEY,
    entidad   TEXT NOT NULL,
    entidad_id INT,
    accion    TEXT NOT NULL,
    usuario   TEXT NOT NULL,
    fecha     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> Si ya tenés la base del schema original, usá `db/migracion-post-pull.sql` para aplicar
> solo los cambios incrementales sin perder datos.

## API

- **Base URL**: `http://localhost:3000/api`
- **Swagger UI**: `http://localhost:3000/docs`
- Autenticación: `Authorization: Bearer <token>` en todos los endpoints salvo login

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login — devuelve `access_token`, `nombre` y `rol` |
| GET | `/api/clientes` | Listado (filtro `?estado=ACTIVO\|BAJA`) |
| POST | `/api/clientes` | Crear cliente |
| PATCH | `/api/clientes/:id` | Editar nombre / estado / teléfono / email |
| GET | `/api/clientes/export.csv` | Exportar clientes como CSV |
| GET | `/api/proyectos` | Listado paginado (`?nombre=&estado=&clienteId=&sort=&dir=&page=&pageSize=`) |
| POST | `/api/proyectos` | Crear proyecto |
| GET | `/api/proyectos/:id` | Detalle con tareas y cliente |
| PATCH | `/api/proyectos/:id` | Editar nombre / estado / cliente / fecha_fin |
| GET | `/api/proyectos/export.csv` | Exportar proyectos como CSV |
| POST | `/api/tareas` | Crear tarea |
| PATCH | `/api/tareas/:id` | Editar descripción / estado |
| DELETE | `/api/tareas/:id` | Eliminar tarea |
| GET | `/api/historial` | Historial de cambios (solo ADMIN) |
| GET | `/api/estadisticas` | Métricas del dashboard |
| GET | `/api/usuarios` | Listar usuarios (solo ADMIN) |
| POST | `/api/usuarios` | Crear usuario (solo ADMIN) |
| PATCH | `/api/usuarios/:id` | Editar nombre / clave / rol / estado (solo ADMIN) |

## Equipo

| Integrante | Feature principal |
|---|---|
| Nahuel Marcilli | Base MVP · Roles · Búsqueda avanzada · Kanban |
| Mai | Estadísticas · Fecha de fin / ATRASADO · CSV export |
| Javier | Historial de cambios |
| Denise | Datos de contacto de clientes |
| Juli | CRUD de Usuarios |

---

Tecnicatura Universitaria en Desarrollo Web · DAW 2026 · Primer Cuatrimestre
