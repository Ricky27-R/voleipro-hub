-- Script para aplicar el sistema de entrenadores asistentes
-- Ejecuta este script en el SQL Editor de tu dashboard de Supabase

-- 1. Agregar rol de entrenador asistente pendiente
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'entrenador_asistente_pending') THEN
    ALTER TYPE user_role ADD VALUE 'entrenador_asistente_pending';
  END IF;
END $$;

-- 2. Agregar club_id a la tabla profiles si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'club_id') THEN
    ALTER TABLE public.profiles ADD COLUMN club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Crear tabla de códigos de club
CREATE TABLE IF NOT EXISTS public.club_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  role_type user_role NOT NULL DEFAULT 'entrenador_asistente' CHECK (role_type = 'entrenador_asistente'),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Habilitar RLS en club_codes
ALTER TABLE public.club_codes ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para club_codes
DROP POLICY IF EXISTS "Club owners can manage codes" ON public.club_codes;
CREATE POLICY "Club owners can manage codes" ON public.club_codes
  FOR ALL USING (
    club_id IN (
      SELECT id FROM public.clubs WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can use codes to register" ON public.club_codes;
CREATE POLICY "Anyone can use codes to register" ON public.club_codes
  FOR SELECT USING (is_active = true AND expires_at > now());

-- 6. Función para generar código único
CREATE OR REPLACE FUNCTION public.generate_club_code(
  p_club_id UUID,
  p_max_uses INTEGER DEFAULT 1
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Verificar si el usuario es propietario del club
  IF NOT EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE id = p_club_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para generar códigos para este club';
  END IF;
  
  -- Generar código único
  LOOP
    v_code := UPPER(LEFT(MD5(RANDOM()::TEXT), 8));
    
    SELECT EXISTS(
      SELECT 1 FROM public.club_codes 
      WHERE code = v_code AND is_active = true
    ) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  -- Insertar nuevo código
  INSERT INTO public.club_codes (club_id, code, created_by, max_uses)
  VALUES (p_club_id, v_code, auth.uid(), p_max_uses);
  
  RETURN v_code;
END;
$$;

-- 7. Función para registrarse con código de club
CREATE OR REPLACE FUNCTION public.register_with_club_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_info RECORD;
  v_user_id UUID;
BEGIN
  -- Obtener usuario actual
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Obtener información del código
  SELECT * INTO v_code_info
  FROM public.club_codes
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND expires_at > now()
    AND current_uses < max_uses;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código inválido, expirado o ya utilizado';
  END IF;
  
  -- Actualizar perfil del usuario
  UPDATE public.profiles
  SET 
    role = 'entrenador_asistente_pending',
    club_id = v_code_info.club_id
  WHERE id = v_user_id;
  
  -- Actualizar uso del código
  UPDATE public.club_codes
  SET 
    current_uses = current_uses + 1,
    updated_at = now()
  WHERE id = v_code_info.id;
  
  -- Desactivar código si se alcanzó el máximo de usos
  IF v_code_info.current_uses + 1 >= v_code_info.max_uses THEN
    UPDATE public.club_codes
    SET is_active = false
    WHERE id = v_code_info.id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'role', 'entrenador_asistente_pending',
    'club_id', v_code_info.club_id
  );
END;
$$;

-- 8. Función para aprobar entrenador asistente
CREATE OR REPLACE FUNCTION public.approve_assistant_coach(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_club_id UUID;
BEGIN
  -- Obtener club del usuario
  SELECT club_id INTO v_user_club_id
  FROM public.profiles
  WHERE id = p_user_id AND role = 'entrenador_asistente_pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar si el usuario actual es propietario del club
  IF NOT EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE id = v_user_club_id AND user_id = auth.uid()
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar rol a aprobado
  UPDATE public.profiles
  SET role = 'entrenador_asistente'
  WHERE id = p_user_id AND role = 'entrenador_asistente_pending';
  
  RETURN FOUND;
END;
$$;

-- 9. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_club_codes_code ON public.club_codes(code);
CREATE INDEX IF NOT EXISTS idx_club_codes_club_id ON public.club_codes(club_id);
CREATE INDEX IF NOT EXISTS idx_profiles_club_id ON public.profiles(club_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 10. Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Sistema de entrenadores asistentes aplicado exitosamente!';
END $$;
