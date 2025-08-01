-- Crear tabla para códigos únicos de club
CREATE TABLE public.club_invitation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para solicitudes de entrenadores asistentes
CREATE TABLE public.assistant_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.club_invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para club_invitation_codes
CREATE POLICY "Club owners can manage their invitation codes"
ON public.club_invitation_codes
FOR ALL
USING (is_club_owner(club_id))
WITH CHECK (is_club_owner(club_id));

CREATE POLICY "Anyone can view invitation codes"
ON public.club_invitation_codes
FOR SELECT
USING (true);

-- Políticas para assistant_requests
CREATE POLICY "Club owners can view requests for their club"
ON public.assistant_requests
FOR SELECT
USING (is_club_owner(club_id));

CREATE POLICY "Club owners can update requests for their club"
ON public.assistant_requests
FOR UPDATE
USING (is_club_owner(club_id));

CREATE POLICY "Users can create requests"
ON public.assistant_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON public.assistant_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Función para generar código único de club
CREATE OR REPLACE FUNCTION public.generate_club_code(club_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  random_part text;
  club_code text;
BEGIN
  -- Generar parte aleatoria de 8 caracteres
  random_part := substring(md5(random()::text) from 1 for 8);
  
  -- Combinar nombre del club (sin espacios, primera palabra) con parte aleatoria
  club_code := split_part(club_name, ' ', 1) || '-' || random_part;
  
  RETURN club_code;
END;
$$;

-- Función para aceptar solicitud de asistente
CREATE OR REPLACE FUNCTION public.approve_assistant_request(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record assistant_requests%ROWTYPE;
BEGIN
  -- Verificar que el usuario actual sea propietario del club
  SELECT * INTO request_record
  FROM assistant_requests
  WHERE id = request_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF NOT is_club_owner(request_record.club_id) THEN
    RETURN false;
  END IF;
  
  -- Actualizar el perfil del usuario para que sea asistente
  UPDATE profiles
  SET role = 'asistente', club_id = request_record.club_id
  WHERE id = request_record.user_id;
  
  -- Marcar la solicitud como aprobada
  UPDATE assistant_requests
  SET status = 'approved', updated_at = now()
  WHERE id = request_id;
  
  RETURN true;
END;
$$;

-- Trigger para timestamps
CREATE TRIGGER update_club_invitation_codes_updated_at
BEFORE UPDATE ON public.club_invitation_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assistant_requests_updated_at
BEFORE UPDATE ON public.assistant_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();