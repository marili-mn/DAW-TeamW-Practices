# Despliegue en la nube — TFI DAW 2026

Documentación del despliegue del sistema en Vercel (frontend) + Render (backend + base de datos).
El código de despliegue vive en la rama `deploy`.

---

## Arquitectura

```
Browser
  │
  ▼
Vercel  (Angular — archivos estáticos)
  │  /api/* → rewrite en vercel.json
  ▼
Render Web Service  (NestJS — Node.js)
  │
  ▼
Render PostgreSQL  (tfi-db)
```

El frontend hace llamadas relativas a `/api/...` igual que en local.
Vercel intercepta esas rutas y las redirige al backend en Render mediante un rewrite,
replicando exactamente el comportamiento del proxy nginx local.

---

## URLs de producción

| Servicio | URL |
|---|---|
| Frontend | `https://tfi-daw.vercel.app` |
| Backend API | `https://tfi-backend-rwwq.onrender.com/api` |
| Base de datos | interna a Render (no expuesta) |

---

## Archivos de configuración

### `frontend/vercel.json`
```json
{
  "buildCommand": "ng build",
  "outputDirectory": "dist/frontend/browser",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://tfi-backend-rwwq.onrender.com/api/:path*" },
    { "source": "/(.*)",       "destination": "/index.html" }
  ]
}
```
- Primer rewrite: proxy `/api/*` → Render (sin cambios en el código Angular)
- Segundo rewrite: SPA routing (todas las rutas devuelven `index.html`)

### `render.yaml`
Define el Web Service y la base de datos como Infrastructure as Code.
Render lo lee automáticamente al conectar el repositorio.

---

## Variables de entorno en Render

Configuradas en el dashboard del Web Service `tfi-backend`:

| Variable | Valor | Descripción |
|---|---|---|
| `NODE_ENV` | `production` | Deshabilita Swagger y activa optimizaciones |
| `DATABASE_URL` | `postgresql://...` | URL interna de Render PostgreSQL |
| `JWT_SECRET` | string secreto | Firma los tokens JWT |
| `FRONTEND_URL` | URL de Vercel | Permite CORS desde el frontend |
| `PORT` | `10000` | Puerto que usa Render internamente |

---

## Cómo funciona la conexión a la base de datos

`backend/src/app.module.ts` detecta el entorno automáticamente:

```
Si DATABASE_URL existe  →  parsea la URL, activa SSL (requerido por Render)
Si no existe            →  usa DB_HOST / DB_PORT / DB_USER / DB_PASS / DB_NAME (local)
```

No hay cambios de código entre local y producción.

---

## Inicializar la base de datos en Render (una sola vez)

Obtener el PSQL Command desde Render → tfi-db → Connections, luego:

```powershell
# Windows PowerShell
$env:PGPASSWORD = "<password>"
psql -h <host>.oregon-postgres.render.com -U <user> <dbname> -f db/Script_BD.sql
psql -h <host>.oregon-postgres.render.com -U <user> <dbname> -f db/seed-demo.sql
```

```bash
# Linux / macOS
PGPASSWORD="<password>" psql -h <host>.oregon-postgres.render.com -U <user> <dbname> -f db/Script_BD.sql
PGPASSWORD="<password>" psql -h <host>.oregon-postgres.render.com -U <user> <dbname> -f db/seed-demo.sql
```

---

## Swagger en producción

Deshabilitado por defecto (`NODE_ENV=production` → HTTP 404 en `/docs`).

Para habilitarlo temporalmente desde la máquina local (requiere PM2 corriendo):
```bash
python manage.py swagger on   # agrega SWAGGER=true al .env y reinicia PM2
python manage.py swagger off  # lo deshabilita
```

Para habilitarlo en Render: agregar `SWAGGER=true` en las variables de entorno
del Web Service → Manual Deploy.

---

## Limitaciones del free tier

| Limitación | Detalle |
|---|---|
| Spin-down | El backend se apaga tras 15 min de inactividad |
| Cold start | El primer request tras inactividad tarda ~30 seg |
| DB gratuita | La PostgreSQL de Render free expira a los 90 días |

---

## Pasos para redesplegar

Si se hacen cambios en la rama `deploy`, Render y Vercel detectan el push
y redesplegan automáticamente.

Para forzar un redespliegue manual:
- **Render**: dashboard → Web Service → Manual Deploy
- **Vercel**: dashboard → proyecto → Deployments → Redeploy
