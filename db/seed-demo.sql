-- seed-demo.sql: datos de demostración para el video del TFI.
-- Temática: espacio + fútbol mundial + tech.
-- Idempotente: limpia los datos previos y recarga.
-- Requiere schema aplicado (Script_BD.sql).

-- ── Limpiar en orden por FK ──────────────────────────────────────────────────
DELETE FROM tareas;
DELETE FROM proyectos;
DELETE FROM clientes WHERE nombre IN (
  'NASA','SpaceX','Stark Industries','FIFA','Mercado Libre',
  'ESA','Blockbuster',
  -- nombres del seed anterior por si quedaron
  'AFA','Globant','Netflix','Apple',
  'Despegar','Rappi Argentina','OLX','Ualá','Banco Galicia','La Nación','YPF','Estudio Beccar Varela'
);

-- ── Clientes (6 activos + 1 baja) ────────────────────────────────────────────
INSERT INTO clientes (nombre, estado, telefono, email) VALUES
  ('NASA',             'ACTIVO', '+1 202 358 0001',  'contacto@nasa.gov'),
  ('SpaceX',           'ACTIVO', '+1 310 363 6000',  'info@spacex.com'),
  ('Stark Industries', 'ACTIVO', '+1 917 555 0199',  'tony@starkindustries.com'),
  ('FIFA',             'ACTIVO', '+41 43 222 7777',  'info@fifa.com'),
  ('Mercado Libre',    'ACTIVO', '+54 11 4640 8000', 'hola@mercadolibre.com'),
  ('ESA',              'ACTIVO', '+31 71 565 6565',  'contact@esa.int'),
  ('Blockbuster',      'BAJA',   NULL,                NULL);

-- ── Proyectos (8: 4 ACTIVO, 2 FINALIZADO, 1 BAJA, 1 ACTIVO sin cliente)
--    Atrasados (fecha_fin < 2026-06-14): Starlink API y VAR cloud
INSERT INTO proyectos (nombre, estado, fecha_fin, id_cliente) VALUES
  ('Sistema de telemetría Artemis III',  'ACTIVO',    '2026-09-30', (SELECT id FROM clientes WHERE nombre = 'NASA')),
  ('Integración Starlink API',           'ACTIVO',    '2026-05-01', (SELECT id FROM clientes WHERE nombre = 'SpaceX')),
  ('Sistema JARVIS v3',                  'ACTIVO',    '2026-12-31', (SELECT id FROM clientes WHERE nombre = 'Stark Industries')),
  ('App oficial Mundial 2026',           'ACTIVO',    '2026-11-01', (SELECT id FROM clientes WHERE nombre = 'FIFA')),
  ('Sistema de arbitraje VAR cloud',     'ACTIVO',    '2026-06-01', (SELECT id FROM clientes WHERE nombre = 'FIFA')),
  ('Migración a microservicios',         'FINALIZADO','2026-02-28', (SELECT id FROM clientes WHERE nombre = 'Mercado Libre')),
  ('Rover Navigation AI',                'FINALIZADO','2026-03-15', (SELECT id FROM clientes WHERE nombre = 'ESA')),
  ('Automatización CI/CD',               'BAJA',      NULL,         (SELECT id FROM clientes WHERE nombre = 'Mercado Libre')),
  ('Dashboard KPIs interno',             'ACTIVO',    '2026-09-01', NULL);

-- ── Tareas (18 distribuidas) ──────────────────────────────────────────────────

-- NASA — Artemis III
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Diseño del protocolo de telemetría',               'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Sistema de telemetría Artemis III')),
  ('Integración con sensores de presión',              'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema de telemetría Artemis III')),
  ('Alertas de anomalía en tiempo real',               'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema de telemetría Artemis III'));

-- SpaceX — Starlink API (ATRASADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Autenticación OAuth2 con API Starlink',            'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Integración Starlink API')),
  ('Monitoreo de latencia por antena',                 'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Integración Starlink API')),
  ('Panel de administración de terminales',            'BAJA',       (SELECT id FROM proyectos WHERE nombre = 'Integración Starlink API'));

-- Stark — JARVIS v3
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Reconocimiento facial con IA',                     'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Sistema JARVIS v3')),
  ('Procesamiento de lenguaje natural multiidioma',    'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema JARVIS v3')),
  ('Cifrado cuántico de comunicaciones',               'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema JARVIS v3'));

-- FIFA — App Mundial
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Bracket interactivo de grupos',                    'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'App oficial Mundial 2026')),
  ('Estadísticas en tiempo real por jugador',          'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'App oficial Mundial 2026'));

-- FIFA — VAR cloud (ATRASADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Pipeline de procesamiento de video en la nube',   'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Sistema de arbitraje VAR cloud')),
  ('Detección automática de offside con IA',          'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Sistema de arbitraje VAR cloud'));

-- Mercado Libre — Microservicios (FINALIZADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Extracción del servicio de pagos',                 'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Migración a microservicios')),
  ('Migración de auth a OAuth2/PKCE',                  'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Migración a microservicios'));

-- ESA — Rover AI (FINALIZADO)
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Modelo de navegación autónoma',                    'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Rover Navigation AI')),
  ('Comunicación de baja latencia con la base',        'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Rover Navigation AI'));

-- Interno — Dashboard KPIs
INSERT INTO tareas (descripcion, estado, id_proyecto) VALUES
  ('Conexión a fuentes de datos internas',             'FINALIZADA', (SELECT id FROM proyectos WHERE nombre = 'Dashboard KPIs interno')),
  ('Gráficos de rendimiento por equipo',               'PENDIENTE',  (SELECT id FROM proyectos WHERE nombre = 'Dashboard KPIs interno'));
