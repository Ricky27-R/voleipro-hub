-- Add assistant coach role and club code system
-- Date: 2025-01-01
-- 
-- This migration adds:
-- - entrenador_asistente_pending role for assistant coaches waiting approval
-- - club_codes table for generating invitation codes for assistant coaches
-- - Functions for generating codes and registering assistant coaches
-- - Approval system for assistant coaches
-- 
-- Note: Players are managed in the existing players table, not as system users

-- Add 'entrenador_asistente_pending' role
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'entrenador_asistente_pending') THEN
    ALTER TYPE user_role ADD VALUE 'entrenador_asistente_pending';
  END IF;
END $$;

-- Add club_id to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'club_id') THEN
    ALTER TABLE public.profiles ADD COLUMN club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Note: team_id not needed in profiles since players are managed in the players table

-- Create club codes table for assistant coach registration only
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

-- Enable RLS on club_codes
ALTER TABLE public.club_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for club_codes
CREATE POLICY "Club owners can manage codes" ON public.club_codes
  FOR ALL USING (
    club_id IN (
      SELECT id FROM public.clubs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can use codes to register" ON public.club_codes
  FOR SELECT USING (is_active = true AND expires_at > now());

-- Function to generate unique club code for assistant coaches
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
  -- Check if user is club owner
  IF NOT EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE id = p_club_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para generar códigos para este club';
  END IF;
  
  -- Generate unique code
  LOOP
    v_code := UPPER(LEFT(MD5(RANDOM()::TEXT), 8));
    
    SELECT EXISTS(
      SELECT 1 FROM public.club_codes 
      WHERE code = v_code AND is_active = true
    ) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  -- Insert new code for assistant coach
  INSERT INTO public.club_codes (club_id, code, created_by, max_uses)
  VALUES (p_club_id, v_code, auth.uid(), p_max_uses);
  
  RETURN v_code;
END;
$$;

-- Function to register with club code (assistant coaches only)
CREATE OR REPLACE FUNCTION public.register_with_club_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_info RECORD;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Get code information
  SELECT * INTO v_code_info
  FROM public.club_codes
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND expires_at > now()
    AND current_uses < max_uses;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código inválido, expirado o ya utilizado';
  END IF;
  
  -- Update user profile to assistant coach pending
  UPDATE public.profiles
  SET 
    role = 'entrenador_asistente_pending',
    club_id = v_code_info.club_id
  WHERE id = v_user_id;
  
  -- Update code usage
  UPDATE public.club_codes
  SET 
    current_uses = current_uses + 1,
    updated_at = now()
  WHERE id = v_code_info.id;
  
  -- Disable code if max uses reached
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

-- Function to approve assistant coach
CREATE OR REPLACE FUNCTION public.approve_assistant_coach(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_club_id UUID;
BEGIN
  -- Get user's club
  SELECT club_id INTO v_user_club_id
  FROM public.profiles
  WHERE id = p_user_id AND role = 'entrenador_asistente_pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if current user is the club owner
  IF NOT EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE id = v_user_club_id AND user_id = auth.uid()
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Update role to approved
  UPDATE public.profiles
  SET role = 'entrenador_asistente'
  WHERE id = p_user_id AND role = 'entrenador_asistente_pending';
  
  RETURN FOUND;
END;
$$;

-- Note: Player approval function not needed since players are managed in the players table

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_club_codes_code ON public.club_codes(code);
CREATE INDEX IF NOT EXISTS idx_club_codes_club_id ON public.club_codes(club_id);
CREATE INDEX IF NOT EXISTS idx_profiles_club_id ON public.profiles(club_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
