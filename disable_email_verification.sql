-- DESHABILITAR COMPLETAMENTE LA VERIFICACIÓN DE EMAIL
-- Este script asegura que no haya problemas con email no verificado
-- Fecha: 2025-01-15

-- 1. Actualizar todos los usuarios existentes para marcarlos como verificados
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Actualizar función handle_new_user para establecer email_confirmed_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Marcar el email como confirmado automáticamente
  UPDATE auth.users 
  SET email_confirmed_at = now() 
  WHERE id = new.id AND email_confirmed_at IS NULL;
  
  -- Crear perfil
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'entrenador_principal'  -- Sin aprobación requerida
  );
  RETURN new;
END;
$function$;

-- Mensaje de confirmación
SELECT 'Email verification disabled successfully - All users marked as verified' as resultado;
