-- Datos de demostración para la presentación / video.
-- Idempotente: usa ON CONFLICT DO NOTHING en nombres únicos.
-- Distribución pensada para que las estadísticas se vean ricas:
--   * proyectos en los 3 estados
--   * algunos atrasados (fecha_fin < CURRENT_DATE)
--   * algunos sin cliente (proyectos internos)
--   * tareas mix pendientes/finalizadas/bajas para el kanban

-- =========================================================================
-- CLIENTES (10 reales + el ACME que ya seedea el script base)
-- =========================================================================

INSERT INTO clientes (nombre, estado, telefono, email) VALUES
  ('Globant',           'ACTIVO', '+54 11 4555-1234', 'contacto@globant.com'),
  ('Mercado Libre',     'ACTIVO', '+54 11 4640-8000', 'proveedores@mercadolibre.com'),
  ('Despegar',          'ACTIVO', '+54 11 4316-1234', 'tech@despegar.com'),
  ('Rappi Argentina',   'ACTIVO', '+54 11 5263-7890', 'partners@rappi.com.ar'),
  ('OLX',               'ACTIVO', '+54 11 5279-0500', 'soporte@olx.com.ar'),
  ('Ualá',              'ACTIVO', '+54 11 5263-1111', 'business@uala.com.ar'),
  ('Banco Galicia',     'ACTIVO', '+54 11 6329-0000', 'tecnologia@bancogalicia.com.ar'),
  ('La Nación',         'ACTIVO', '+54 11 4319-1600', 'digital@lanacion.com.ar'),
  ('YPF',               'ACTIVO', '+54 11 5441-2000', 'innovacion@ypf.com'),
  ('Estudio Beccar Varela', 'BAJA', '+54 11 4379-6800', 'info@beccarvarela.com')
ON CONFLICT (nombre) DO NOTHING;

-- =========================================================================
-- PROYECTOS (15)
-- =========================================================================
-- Mix de estados y fechas para que las métricas se vean variadas.
-- Usamos subqueries para resolver el id_cliente por nombre, así el seed
-- aguanta cualquier orden de IDs.

INSERT INTO proyectos (nombre, estado, id_cliente, fecha_fin) VALUES
  ('App móvil de delivery',         'ACTIVO',     (SELECT id FROM clientes WHERE nombre = 'Rappi Argentina'),       CURRENT_DATE + INTERVAL '45 days'),
  ('Migración a microservicios',    'ACTIVO',     (SELECT id FROM clientes WHERE nombre = 'Mercado Libre'),         CURRENT_DATE + INTERVAL '120 days'),
  ('Portal de proveedores',         'ACTIVO',     (SELECT id FROM clientes WHERE nombre = 'YPF'),                   CURRENT_DATE + INTERVAL '60 days'),
  ('Rediseño checkout',             'ACTIVO',     (SELECT id FROM clientes WHERE nombre = 'Despegar'),              CURRENT_DATE - INTERVAL '10 days'),  -- atrasado
  ('Dashboard analítico interno',   'ACTIVO',     NULL,                                                              CURRENT_DATE + INTERVAL '90 days'),
  ('App de pagos QR',               'ACTIVO',     (SELECT id FROM clientes WHERE nombre = 'Ualá'),                  CURRENT_DATE - INTERVAL '5 days'),   -- atrasado
  ('Sistema de turnos online',      'ACTIVO',     (SELECT id FROM clientes WHERE nombre = 'Banco Galicia'),         CURRENT_DATE + INTERVAL '30 days'),
  ('Refactor del CMS',              'ACTIVO',     (SELECT id FROM clientes WHERE nombre = 'La Nación'),             CURRENT_DATE + INTERVAL '14 days'),
  ('Migración onboarding',          'FINALIZADO', (SELECT id FROM clientes WHERE nombre = 'Globant'),               CURRENT_DATE - INTERVAL '30 days'),
  ('PoC de IA generativa',          'FINALIZADO', (SELECT id FROM clientes WHERE nombre = 'Globant'),               CURRENT_DATE - INTERVAL '60 days'),
  ('Auditoría de seguridad 2025',   'FINALIZADO', NULL,                                                              CURRENT_DATE - INTERVAL '90 days'),
  ('Catálogo de productos v2',      'FINALIZADO', (SELECT id FROM clientes WHERE nombre = 'OLX'),                   CURRENT_DATE - INTERVAL '120 days'),
  ('Renovación stack legacy',       'BAJA',       (SELECT id FROM clientes WHERE nombre = 'Estudio Beccar Varela'), NULL),
  ('Integración con AFIP',          'BAJA',       NULL,                                                              NULL),
  ('Capacitación equipo backend',   'ACTIVO',     NULL,                                                              CURRENT_DATE + INTERVAL '180 days')
ON CONFLICT (nombre) DO NOTHING;

-- =========================================================================
-- TAREAS (~36)
-- =========================================================================
-- Distribuidas entre los proyectos ACTIVO/FINALIZADO. Mix de estados.

INSERT INTO tareas (descripcion, estado, id_proyecto)
SELECT t.descripcion, t.estado::estados_tareas, p.id
FROM (VALUES
  -- App móvil de delivery
  ('App móvil de delivery',       'Diseñar pantalla de login',          'FINALIZADA'),
  ('App móvil de delivery',       'Integrar Google Maps SDK',           'PENDIENTE'),
  ('App móvil de delivery',       'Flujo de pedido + checkout',         'PENDIENTE'),
  ('App móvil de delivery',       'Notificaciones push',                'PENDIENTE'),
  -- Migración a microservicios
  ('Migración a microservicios',  'Definir bounded contexts',           'FINALIZADA'),
  ('Migración a microservicios',  'Extraer servicio de usuarios',       'FINALIZADA'),
  ('Migración a microservicios',  'Extraer servicio de pedidos',        'PENDIENTE'),
  ('Migración a microservicios',  'Migrar autenticación a OAuth2',      'PENDIENTE'),
  ('Migración a microservicios',  'Setear observability (OTel)',        'PENDIENTE'),
  -- Portal de proveedores
  ('Portal de proveedores',       'Wireframes alta-fi',                 'FINALIZADA'),
  ('Portal de proveedores',       'Carga masiva de productos',          'PENDIENTE'),
  ('Portal de proveedores',       'Reportes de facturación',            'PENDIENTE'),
  -- Rediseño checkout (atrasado)
  ('Rediseño checkout',           'Tests A/B del nuevo flujo',          'PENDIENTE'),
  ('Rediseño checkout',           'Quitar pasos del wizard',            'PENDIENTE'),
  ('Rediseño checkout',           'Métricas de conversión',             'BAJA'),
  -- Dashboard analítico interno
  ('Dashboard analítico interno', 'Conectar a BigQuery',                'FINALIZADA'),
  ('Dashboard analítico interno', 'Gráficos de churn mensual',          'PENDIENTE'),
  -- App de pagos QR (atrasado)
  ('App de pagos QR',             'Onboarding de comercios',            'PENDIENTE'),
  ('App de pagos QR',             'Compliance PCI-DSS',                 'PENDIENTE'),
  ('App de pagos QR',             'Generar QR dinámico',                'FINALIZADA'),
  -- Sistema de turnos online
  ('Sistema de turnos online',    'Calendario por sucursal',            'PENDIENTE'),
  ('Sistema de turnos online',    'Recordatorios por SMS',              'PENDIENTE'),
  -- Refactor del CMS
  ('Refactor del CMS',            'Migrar editor a Lexical',            'PENDIENTE'),
  ('Refactor del CMS',            'Versionado de notas',                'FINALIZADA'),
  ('Refactor del CMS',            'Quitar plugins legacy',              'BAJA'),
  -- Migración onboarding (finalizado)
  ('Migración onboarding',        'KYC con biometría',                  'FINALIZADA'),
  ('Migración onboarding',        'Integración con RENAPER',            'FINALIZADA'),
  -- PoC IA
  ('PoC de IA generativa',        'Comparar Claude vs GPT-4',           'FINALIZADA'),
  ('PoC de IA generativa',        'Estimación de costos',               'FINALIZADA'),
  -- Auditoría de seguridad
  ('Auditoría de seguridad 2025', 'Pentest externo',                    'FINALIZADA'),
  ('Auditoría de seguridad 2025', 'Revisión de dependencias',           'FINALIZADA'),
  -- Catálogo v2
  ('Catálogo de productos v2',    'Búsqueda con Elastic',               'FINALIZADA'),
  ('Catálogo de productos v2',    'Filtros facetados',                  'FINALIZADA'),
  -- Capacitación
  ('Capacitación equipo backend', 'Workshop NestJS avanzado',           'PENDIENTE'),
  ('Capacitación equipo backend', 'Workshop TypeORM patterns',          'PENDIENTE'),
  ('Capacitación equipo backend', 'Workshop testing E2E',               'PENDIENTE')
) AS t(proyecto, descripcion, estado)
JOIN proyectos p ON p.nombre = t.proyecto
WHERE NOT EXISTS (
  SELECT 1 FROM tareas tt
  WHERE tt.descripcion = t.descripcion AND tt.id_proyecto = p.id
);
