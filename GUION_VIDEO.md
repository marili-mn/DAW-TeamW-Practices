# Guion de Video — TFI DAW 2026

**Proyecto:** Sistema de Gestión de Proyectos  
**Equipo:** Team W  
**Duración estimada:** 8 a 9 minutos  
**Fecha de entrega:** Junio 2026

---

## Preparación previa a la grabación

- Browser abierto en `http://localhost:8080` con zoom al 125%
- Modo oscuro del sistema operativo **desactivado**
- Terminal abierta lista para ejecutar `python manage.py status`
- Sesión cerrada — pantalla de login visible al inicio

---

## Segmento 1 — Introducción y arranque del sistema

**Presentador:** Nahuel Marcilli  
**Duración:** 0:00 – 1:30  
**Pantalla:** Terminal

**Acción:** Ejecutar en vivo `python manage.py status` y mostrar el output.

**Guion:**

> "Buenas, somos el Team W. Desarrollamos un sistema de gestión de proyectos y clientes como Trabajo Final de la materia Desarrollo de Aplicaciones Web. El stack es NestJS en el backend, Angular en el frontend, y PostgreSQL como base de datos. Para el despliegue usamos nginx y PM2."

> "En lugar de levantar los servicios manualmente, armamos un orquestador en Python que centraliza todo. Acá pueden ver que el backend está corriendo bajo PM2, nginx está activo en el puerto 8080 y proxea las llamadas a la API. Todo el flujo —setup, build, deploy— está automatizado desde este script."

---

## Segmento 2 — Login y creación de proyectos

**Presentador:** Nahuel Marcilli  
**Duración:** 1:30 – 2:45  
**Pantalla:** Browser — pantalla de login en `http://localhost:8080`

**Acción:** Iniciar sesión con `usuario` / `clave`. Mostrar el chip ADMIN en el topbar. Navegar a Proyectos, crear uno nuevo (nombre: *Misión Artemis IV*, cliente: NASA, fecha fin: 2026-08-01). Abrir el detalle y agregar una tarea.

**Guion:**

> "Para acceder al sistema se requiere usuario y contraseña. El sistema maneja dos roles: ADMIN y ESTANDAR, y los permisos se aplican tanto en el backend como en la interfaz."

> "Como administrador tengo acceso a todas las secciones. Creo un proyecto nuevo, le asigno un cliente y una fecha límite. Cada proyecto puede tener un cliente asociado o ser un proyecto interno sin cliente. Dentro del detalle puedo agregar tareas con su estado."

---

## Segmento 3 — Búsqueda avanzada

**Presentador:** Nahuel Marcilli  
**Duración:** 2:45 – 3:30  
**Pantalla:** Browser — listado de Proyectos

**Acción:** Filtrar por nombre *"Star"*, cambiar el dropdown de estado a ACTIVO, ordenar por fecha fin, cambiar el tamaño de página a 5 registros.

**Guion:**

> "La búsqueda es server-side. Se puede filtrar por nombre, estado o cliente, ordenar por cualquier columna y configurar el tamaño de página. Todo viaja como query params al backend; no se descarga la tabla completa al navegador. Esto lo implementamos con QueryBuilder de TypeORM."

---

## Segmento 4 — Fecha de finalización y exportación CSV

**Presentadora:** Denise Aguilera  
**Duración:** 3:30 – 4:30  
**Pantalla:** Browser — listado de Proyectos

**Acción:** Señalar los badges naranjas ATRASADO en la tabla (Starlink API y VAR cloud). Abrir el detalle de uno y mostrar el badge en el encabezado. Hacer click en Exportar CSV y abrir el archivo descargado.

**Guion:**

> "Los proyectos tienen una fecha de finalización objetivo. Cuando esa fecha ya pasó, el sistema los marca automáticamente como ATRASADO. No hace falta ninguna acción manual: se calcula en el momento en que se consulta el listado."

> "También podemos exportar el listado completo a CSV. El archivo incluye nombre, estado, cliente y fecha de fin, y se puede abrir directamente en Excel o Google Sheets."

---

## Segmento 5 — Dashboard de estadísticas

**Presentadora:** Denise Aguilera  
**Duración:** 4:30 – 5:15  
**Pantalla:** Browser — sección Estadísticas

**Acción:** Señalar cada card de totales, luego las barras de distribución por estado y el ranking de clientes.

**Guion:**

> "El dashboard de estadísticas da una foto del sistema en tiempo real. Tenemos cards con los totales: proyectos activos, proyectos atrasados, tareas pendientes y clientes activos. Abajo vemos la distribución de proyectos y tareas por estado en barras de color, y un ranking de los clientes con más proyectos asociados."

---

## Segmento 6 — Historial de cambios

**Presentador:** Francisco Javier Acosta  
**Duración:** 5:15 – 6:15  
**Pantalla:** Browser — sección Historial

**Acción:** Mostrar la tabla de historial. En vivo: editar el nombre de un proyecto, volver al historial, recargar y señalar el nuevo registro en la cima.

**Guion:**

> "Cada operación queda registrada automáticamente en el historial de cambios. Esto lo implementé con un interceptor global en NestJS que captura todas las mutaciones de forma transversal, sin modificar cada servicio individualmente."

> "La tabla muestra qué usuario realizó la acción, sobre qué entidad, qué acción fue y cuándo. Acabo de editar un proyecto y ya aparece registrado."

---

## Segmento 7 — Datos de contacto de clientes

**Presentadora:** Denise Ailen Lescano  
**Duración:** 6:15 – 6:50  
**Pantalla:** Browser — sección Clientes

**Acción:** Mostrar la tabla con las columnas de teléfono y email. Editar el cliente ESA, agregar teléfono y email, guardar y mostrar el resultado en la tabla.

**Guion:**

> "Los clientes ahora tienen datos de contacto: teléfono y email. Son opcionales; un cliente dado de baja como Blockbuster puede no tenerlos. Se ven directamente en la tabla para tenerlos a mano, y se cargan desde el formulario de edición."

---

## Segmento 8 — CRUD de Usuarios

**Presentadora:** Julieta Roveres  
**Duración:** 6:50 – 7:50  
**Pantalla:** Browser — sección Usuarios

**Acción:** Mostrar la tabla con columnas Nombre, Rol y Estado. Crear usuario *demo* con rol ESTANDAR. Dar de baja, luego reactivar. Cerrar sesión e iniciar como *demo* para mostrar que el link Usuarios no aparece.

**Guion:**

> "La gestión de usuarios es una sección exclusiva para administradores. Desde acá se pueden crear usuarios, asignarles un rol y cambiar su estado."

> "Creo un usuario nuevo con rol ESTANDAR. Lo doy de baja y lo reactivo. Las contraseñas se almacenan con bcrypt y nunca se exponen en la API."

> "Si inicio sesión con ese usuario ESTANDAR, la sección Usuarios directamente no aparece en el menú. Y si se intentara acceder por URL, el backend responde con 403."

---

## Segmento 9 — Vista Kanban

**Presentador:** Nahuel Marcilli  
**Duración:** 7:50 – 8:30  
**Pantalla:** Browser — detalle de un proyecto

**Acción:** Cambiar a vista Kanban con el toggle. Arrastrar una tarjeta de PENDIENTE a FINALIZADA. Recargar la página y mostrar que el cambio persiste.

**Guion:**

> "En el detalle de cada proyecto hay dos vistas: lista y tablero Kanban. En el tablero, las tareas se organizan por columnas según su estado y se pueden arrastrar entre columnas para cambiarles el estado."

> "El cambio se guarda en la base de datos en tiempo real. Si recargo la página, la tarea sigue en el estado al que la moví."

---

## Segmento 10 — Cierre

**Presentadores:** Todos  
**Duración:** 8:30 – 9:00  
**Pantalla:** Browser — perfiles de GitHub

**Acción:** Cada integrante abre su perfil de GitHub y dice su nombre.

| Integrante | GitHub |
| --- | --- |
| Nahuel Marcilli | github.com/marili-mn |
| Denise Aguilera | github.com/dennaguilera |
| Francisco Javier Acosta | github.com/profesorjavier |
| Denise Ailen Lescano | github.com/DeniLescano |
| Julieta Roveres | github.com/JulietaRoveres |

**Guion:**

*(Cada uno muestra su perfil y dice su nombre)*

> "Nahuel Marcilli."

> "Denise Aguilera."

> "Francisco Javier Acosta."

> "Denise Lescano."

> "Julieta Roveres."

*(Nahuel cierra)*

> "Team W — DAW 2026. Gracias."

---

## Notas de producción

- Si graban de forma remota: cada integrante comparte pantalla ~5 segundos mostrando su propio perfil mientras dice su nombre.
- Si graban juntos: una sola pantalla navega los perfiles en orden.
- Tener la base de datos con los datos del seed cargados (NASA, SpaceX, FIFA visibles).
- Ejecutar `python manage.py status` antes de abrir el browser para mostrar que los servicios están activos.
