-- Migración para agregar campos detallados a la tabla clubs
-- Fecha: 2025-08-13

-- Agregar nuevos campos a la tabla clubs
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

-- Crear índices para mejorar el rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_clubs_pais ON public.clubs(pais);
CREATE INDEX IF NOT EXISTS idx_clubs_provincia_region ON public.clubs(provincia_region);
CREATE INDEX IF NOT EXISTS idx_clubs_tipo_club ON public.clubs(tipo_club);
CREATE INDEX IF NOT EXISTS idx_clubs_ciudad ON public.clubs(ciudad);

-- Agregar restricciones de validación
ALTER TABLE public.clubs 
ADD CONSTRAINT check_tipo_club CHECK (
  tipo_club IN ('formativo', 'competitivo', 'escolar', 'universitario', 'recreativo', 'otro')
),
ADD CONSTRAINT check_email_institucional CHECK (
  email_institucional ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
),
ADD CONSTRAINT check_email_personal CHECK (
  email_personal ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Actualizar RLS policies para incluir los nuevos campos
DROP POLICY IF EXISTS "Users can view their own club" ON public.clubs;
CREATE POLICY "Users can view their own club" ON public.clubs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own club" ON public.clubs;
CREATE POLICY "Users can insert their own club" ON public.clubs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own club" ON public.clubs;
CREATE POLICY "Users can update their own club" ON public.clubs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own club" ON public.clubs;
CREATE POLICY "Users can delete their own club" ON public.clubs
  FOR DELETE USING (auth.uid() = user_id);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN public.clubs.provincia_region IS 'Provincia o región donde se encuentra el club';
COMMENT ON COLUMN public.clubs.pais IS 'País donde se encuentra el club';
COMMENT ON COLUMN public.clubs.direccion_principal IS 'Dirección principal o sede del club';
COMMENT ON COLUMN public.clubs.fecha_fundacion IS 'Fecha de fundación del club';
COMMENT ON COLUMN public.clubs.email_institucional IS 'Correo electrónico institucional del club';
COMMENT ON COLUMN public.clubs.telefono_whatsapp IS 'Teléfono o WhatsApp del club';
COMMENT ON COLUMN public.clubs.sitio_web IS 'Sitio web del club (opcional)';
COMMENT ON COLUMN public.clubs.redes_sociales IS 'Redes sociales del club (opcional)';
COMMENT ON COLUMN public.clubs.archivo_estatuto IS 'URL del archivo de estatuto o acta (opcional)';
COMMENT ON COLUMN public.clubs.ruc_registro_legal IS 'RUC o número de registro legal (opcional)';
COMMENT ON COLUMN public.clubs.tipo_club IS 'Tipo de club: formativo, competitivo, escolar, universitario, recreativo, otro';
COMMENT ON COLUMN public.clubs.nombre_representante IS 'Nombre completo del representante del club';
COMMENT ON COLUMN public.clubs.cedula_identificacion IS 'Cédula o identificación del representante';
COMMENT ON COLUMN public.clubs.email_personal IS 'Correo electrónico personal del representante';
COMMENT ON COLUMN public.clubs.telefono_personal IS 'Teléfono personal del representante';
COMMENT ON COLUMN public.clubs.cargo_club IS 'Cargo del representante en el club';
COMMENT ON COLUMN public.clubs.aceptacion_terminos IS 'Indica si el representante aceptó los términos y condiciones';
