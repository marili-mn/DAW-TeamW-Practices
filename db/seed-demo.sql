-- seed-demo.sql: datos de demostración — temática espacio + mundial + tech global
-- Idempotente: limpia los datos de demo previos y recarga.
-- Requiere que el schema ya esté aplicado (Script_BD.sql).

-- Limpiar datos previos respetando FK (tareas → proyectos → clientes)
DELETE FROM tareas   WHERE id_proyecto IN (SELECT id FROM proyectos WHERE nombre IN (
  'Sistema de telemetría Artemis III','App de seguimiento de satélites',
  'Portal de lanzamientos en vivo','Integración Starlink API',
  'Sistema JARVIS v3','Control de exoesqueleto Mark L',
  'App oficial Mundial 2026','Sistema de arbitraje VAR cloud',
  'Portal de selecciones AFA','Plataforma de streaming 4K',
  'Migración a microservicios','Reducción de latencia CDN',
  'Rover Navigation AI','Automatización de despliegue CI/CD',
  'Dashboard KPIs interno',
  -- nombres anteriores por si quedan del seed viejo
  'App móvil de delivery','Migración a microservicios','Portal de proveedores',
  'Rediseño checkout','Dashboard analítico interno','App de pagos QR',
  'Sistema de turnos online','Refactor del CMS','Migración onboarding',
  'PoC de IA generativa','Auditoría de seguridad 2025','Catálogo de productos v2',
  'Renovación stack legacy','Integración con AFIP','Capacitación equipo backend'
));

DELETE FROM proyectos WHERE nombre IN (
  'Sistema de telemetría Artemis III','App de seguimiento de satélites',
  'Portal de lanzamientos en vivo','Integración Starlink API',
  'Sistema JARVIS v3','Control de exoesqueleto Mark L',
  'App oficial Mundial 2026','Sistema de arbitraje VAR cloud',
  'Portal de selecciones AFA','Plataforma de streaming 4K',
  'Migración a microservicios','Reducción de latencia CDN',
  'Rover Navigation AI','Automatización de despliegue CI/CD',
  'Dashboard KPIs interno',
  'App móvil de delivery','Portal de proveedores','Rediseño checkout',
  'Dashboard analítico interno','App de pagos QR','Sistema de turnos online',
  'Refactor del CMS','Migración onboarding','PoC de IA generativa',
  'Auditoría de seguridad 2025','Catálogo de productos v2',
  'Renovación stack legacy','Integración con AFIP','Capacitación equipo backend'
);

DELETE FROM clientes WHERE nombre IN (
  'NASA','SpaceX','Stark Industries','FIFA','AFA','Globant',
  'Mercado Libre','Netflix','Apple','ESA','Blockbuster',
  'Despegar','Rappi Argentina','OLX','Ualá','Banco Galicia',
  'La Nación','YPF','Estudio Beccar Varela'
);

-- ============================================================
-- CLIENTES (10 activos + 1 baja)
-- ============================================================
INSERT INTO clientes (nombre, estado, telefono, email) VALUES
  ('NASA',             'ACTIVO', '+1 202 358 0001', 'contacto@nasa.gov'),
  ('SpaceX',           'ACTIVO', '+1 310 363 6000', 'info@spacex.com'),
  ('Stark Industries', 'ACTIVO', '+1 917 555 0199', 'tony@starkindustries.com'),
  ('FIFA',             'ACTIVO', '+41 43 222 7777', 'info@fifa.com'),
  ('AFA',              'ACTIVO', '+54 11 4331 4848', 'secretaria@afa.org.ar'),
  ('Globant',          'ACTIVO', '+54 11 5199 0000', 'contact@globant.com'),
  ('Mercado Libre',    'ACTIVO', '+54 11 4640 8000', 'hola@mercadolibre.com'),
  ('Netflix',          'ACTIVO', '+1 408 809 5377', 'pr@netflix.com'),
  ('Apple',            'ACTIVO', '+1 408 996 1010', 'media@apple.com'),
  ('ESA',              'ACTIVO', '+31 71 565 6565', 'contact@esa.int'),
  ('Blockbuster',      'BAJA',   NULL,               NULL);

-- ============================================================
-- PROYECTOS (15: 9 ACTIVOS + 3 FINALIZADOS + 1 BAJA + 1 ACTIVO sin cliente)
-- 3 proyectos atrasados: fecha_fin < 2026-06-14
-- ============================================================
INSERT INTO proyectos (nombre, estado, fecha_fin, id_cliente) VALUES
  ('Sistema de telemetría Artemis III',  'ACTIVO',    '2026-09-30', (SELECT id FROM clientes WHERE nombre = 'NASA')),
  ('App de seguimiento de satélites',    'ACTIVO',    '2026-07-15', (SELECT id FROM clientes WHERE nombre = 'NASA')),
  ('Portal de lanzamientos en vivo',     'ACTIVO',    '2026-08-20', (SELECT id FROM clientes WHERE nombre = 'SpaceX')),
  ('Integración Starlink API',           'ACTIVO',    '2026-05-01', (SELECT id FROM clientes WHERE nombre = 'SpaceX')),   -- ATRASADO
  ('Sistema JARVIS v3',                  'ACTIVO',    '2026-12-31', (SELECT id FROM clientes WHERE nombre = 'Stark Industries')),
  ('Control de exoesqueleto Mark L',     'ACTIVO',    '2026-04-10', (SELECT id FROM clientes WHERE nombre = 'Stark Industries')), -- ATRASADO
  ('App oficial Mundial 2026',           'ACTIVO',    '2026-11-01', (SELECT id FROM clientes WHERE nombre = 'FIFA')),
  ('Sistema de arbitraje VAR cloud',     'ACTIVO',    '2026-06-01', (SELECT id FROM clientes WHERE nombre = 'FIFA')),     -- ATRASADO
  ('Portal de selecciones AFA',          'ACTIVO',    '2026-10-15', (SELECT id FROM clientes WHERE nombre = 'AFA')),
  ('Plataforma de streaming 4K',         'FINALIZADO','2026-03-01', (SELECT id FROM clientes WHERE nombre = 'Netflix')),
  ('Migración a microservicios',         'FINALIZADO','2026-02-28', (SELECT id FROM clientes WHERE nombre = 'Mercado Libre')),
  ('Reducción de latencia CDN',          'FINALIZADO','2026-01-15', (SELECT id FROM clientes WHERE nombre = 'Apple')),
  ('Rover Navigation AI',                'ACTIVO',    '2026-12-01', (SELECT id FROM clientes WHERE nombre = 'ESA')),
  ('Automatización de despliegue CI/CD', 'BAJA',      NULL,         (SELECT id FROM clientes WHERE nombre = 'Globant')),
  ('Dashboard KPIs interno',             'ACTIVO',    '2026-09-01', NULL);

-- ============================================================
-- TAREAS (34 tareas distribuidas temáticamente)
-- ============================================================

-- NASA — Telemetría Artemis III
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Diseño del protocolo de telemetría',                  'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Sistema de telemetría Artemis III')),
  ('Integración con sensores de presión y temperatura',   'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema de telemetría Artemis III')),
  ('Alertas de anomalía en tiempo real',                  'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema de telemetría Artemis III'));

-- NASA — App satélites
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Integración con TLE (Two-Line Element)',              'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'App de seguimiento de satélites')),
  ('Mapa 3D de órbitas en tiempo real',                  'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'App de seguimiento de satélites'));

-- SpaceX — Portal lanzamientos
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Streaming HD del lanzamiento',                        'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Portal de lanzamientos en vivo')),
  ('Cuenta regresiva sincronizada con API de misión',     'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Portal de lanzamientos en vivo')),
  ('Notificaciones push 24h antes del lanzamiento',       'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Portal de lanzamientos en vivo'));

-- SpaceX — Starlink API (ATRASADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Autenticación OAuth2 con la API Starlink',            'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Integración Starlink API')),
  ('Monitoreo de latencia por antena',                    'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Integración Starlink API')),
  ('Panel de administración de terminales',               'BAJA',       (SELECT id FROM proyectos WHERE nombre = 'Integración Starlink API'));

-- Stark — JARVIS v3
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Reconocimiento facial con IA en tiempo real',         'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Sistema JARVIS v3')),
  ('Procesamiento de lenguaje natural multiidioma',       'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema JARVIS v3')),
  ('Cifrado cuántico de comunicaciones',                  'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema JARVIS v3'));

-- Stark — Exoesqueleto (ATRASADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Calibración de servomotores de la armadura',          'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Control de exoesqueleto Mark L')),
  ('Interfaz holográfica de control',                     'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Control de exoesqueleto Mark L'));

-- FIFA — App Mundial
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Bracket interactivo de fase de grupos',               'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'App oficial Mundial 2026')),
  ('Estadísticas en tiempo real por jugador',             'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'App oficial Mundial 2026')),
  ('Sistema de compra de entradas integrado',             'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'App oficial Mundial 2026'));

-- FIFA — VAR cloud (ATRASADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Pipeline de procesamiento de video en la nube',       'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Sistema de arbitraje VAR cloud')),
  ('Detección automática de offside con IA',              'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema de arbitraje VAR cloud'));

-- AFA — Portal selecciones
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Perfil de jugadores con historial de partidos',       'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Portal de selecciones AFA')),
  ('Calendario de convocatorias y concentraciones',       'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Portal de selecciones AFA'));

-- Netflix — Streaming 4K (FINALIZADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Transcodificación adaptativa en 4K HDR',              'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Plataforma de streaming 4K')),
  ('Recomendaciones ML personalizadas',                   'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Plataforma de streaming 4K')),
  ('A/B testing de la UI del reproductor',                'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Plataforma de streaming 4K'));

-- Mercado Libre — Microservicios (FINALIZADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Extracción del servicio de pagos',                    'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Migración a microservicios')),
  ('Migración de auth a OAuth2/PKCE',                     'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Migración a microservicios'));

-- Apple — CDN (FINALIZADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Optimización de edge nodes en Latinoamérica',         'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Reducción de latencia CDN')),
  ('Caché de assets estáticos en PoP regional',           'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Reducción de latencia CDN'));

-- ESA — Rover AI
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Modelo de navegación autónoma en terreno irregular',  'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Rover Navigation AI')),
  ('Detección de obstáculos en tiempo real',              'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Rover Navigation AI')),
  ('Comunicación de baja latencia con la base',           'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Rover Navigation AI'));

-- Dashboard KPIs (interno, sin cliente)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Conexión a fuentes de datos internas',                'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Dashboard KPIs interno')),
  ('Gráficos de rendimiento por equipo',                  'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Dashboard KPIs interno')),
  ('Exportación de reportes en PDF',                      'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Dashboard KPIs interno'));
