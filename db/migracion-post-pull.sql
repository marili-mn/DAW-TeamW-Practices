-- Migración incremental para alinear DB local con el commit 1849498.
-- Idempotente: usa IF NOT EXISTS / DO blocks.

DO $$ BEGIN
  CREATE TYPE roles_usuarios AS ENUM ('ADMIN','ESTANDAR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol roles_usuarios NOT NULL DEFAULT 'ESTANDAR';
UPDATE usuarios SET rol = 'ADMIN' WHERE nombre = 'usuario' AND rol = 'ESTANDAR';

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email TEXT;

CREATE TABLE IF NOT EXISTS historial (
  id SERIAL PRIMARY KEY,
  entidad TEXT NOT NULL,
  entidad_id INT,
  accion TEXT NOT NULL,
  usuario TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO usuarios (nombre, clave, estado, rol)
SELECT 'invitado', crypt('clave', gen_salt('bf', 10)), 'ACTIVO', 'ESTANDAR'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE nombre = 'invitado');
