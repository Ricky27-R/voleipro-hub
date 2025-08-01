-- Corregir función para usar el tipo correcto de usuario
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
  
  -- Actualizar el perfil del usuario para que sea entrenador asistente
  UPDATE profiles
  SET role = 'entrenador_asistente', club_id = request_record.club_id
  WHERE id = request_record.user_id;
  
  -- Marcar la solicitud como aprobada
  UPDATE assistant_requests
  SET status = 'approved', updated_at = now()
  WHERE id = request_id;
  
  RETURN true;
END;
$$;