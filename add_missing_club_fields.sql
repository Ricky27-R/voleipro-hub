-- AGREGAR CAMPOS FALTANTES A LA TABLA CLUBS
-- Este script agrega todas las columnas necesarias para el formulario completo
-- Fecha: 2025-01-15

-- Verificar y agregar campos faltantes a la tabla clubs
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS provincia_region TEXT,
ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'Ecuador',
ADD COLUMN IF NOT EXISTS direccion_principal TEXT,
ADD COLUMN IF NOT EXISTS fecha_fundacion DATE,
ADD COLUMN IF NOT EXISTS email_institucional TEXT,
ADD COLUMN IF NOT EXISTS telefono_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS sitio_web TEXT,
ADD COLUMN IF NOT EXISTS redes_sociales TEXT,
ADD COLUMN IF NOT EXISTS archivo_estatuto TEXT,
ADD COLUMN IF NOT EXISTS ruc_registro_legal TEXT,
ADD COLUMN IF NOT EXISTS tipo_club TEXT DEFAULT 'formativo',
ADD COLUMN IF NOT EXISTS nombre_representante TEXT,
ADD COLUMN IF NOT EXISTS cedula_identificacion TEXT,
ADD COLUMN IF NOT EXISTS email_personal TEXT,
ADD COLUMN IF NOT EXISTS telefono_personal TEXT,
ADD COLUMN IF NOT EXISTS cargo_club TEXT,
ADD COLUMN IF NOT EXISTS aceptacion_terminos BOOLEAN DEFAULT false;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clubs_pais ON public.clubs(pais);
CREATE INDEX IF NOT EXISTS idx_clubs_provincia_region ON public.clubs(provincia_region);
CREATE INDEX IF NOT EXISTS idx_clubs_tipo_club ON public.clubs(tipo_club);
CREATE INDEX IF NOT EXISTS idx_clubs_ciudad ON public.clubs(ciudad);

-- Agregar restricciones de validación solo si no existen
DO $$
BEGIN
  -- Verificar y agregar restricción de tipo_club
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_tipo_club' 
    AND table_name = 'clubs'
  ) THEN
    ALTER TABLE public.clubs 
    ADD CONSTRAINT check_tipo_club CHECK (
      tipo_club IN ('formativo', 'competitivo', 'escolar', 'universitario', 'recreativo', 'otro')
    );
  END IF;
  
  -- Verificar y agregar restricción de email_institucional
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_email_institucional' 
    AND table_name = 'clubs'
  ) THEN
    ALTER TABLE public.clubs 
    ADD CONSTRAINT check_email_institucional CHECK (
      email_institucional IS NULL OR email_institucional ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );
  END IF;
  
  -- Verificar y agregar restricción de email_personal
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_email_personal' 
    AND table_name = 'clubs'
  ) THEN
    ALTER TABLE public.clubs 
    ADD CONSTRAINT check_email_personal CHECK (
      email_personal IS NULL OR email_personal ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );
  END IF;
END $$;

-- Mensaje de confirmación
SELECT 'Club fields added successfully - Form should work now!' as resultado;
