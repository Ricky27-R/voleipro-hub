-- DESHABILITAR COMPLETAMENTE LA VERIFICACIÓN DE EMAIL - V2
-- Este script asegura que no haya problemas con email no verificado
-- Versión que maneja conflictos existentes
-- Fecha: 2025-01-15

-- 1. Actualizar todos los usuarios existentes para marcarlos como verificados
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 2. Actualizar función handle_new_user para establecer email_confirmed_at automáticamente
-- Primero DROP si existe, luego CREATE
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Marcar el email como confirmado automáticamente
  UPDATE auth.users 
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = new.id;
  
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

-- 3. Recrear el trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar que todos los usuarios tengan email confirmado
DO $$
DECLARE
    unverified_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unverified_count
    FROM auth.users 
    WHERE email_confirmed_at IS NULL;
    
    IF unverified_count > 0 THEN
        RAISE NOTICE 'Actualizando % usuarios sin verificar', unverified_count;
        
        UPDATE auth.users 
        SET email_confirmed_at = now() 
        WHERE email_confirmed_at IS NULL;
    ELSE
        RAISE NOTICE 'Todos los usuarios ya están verificados';
    END IF;
END $$;

-- Mensaje de confirmación
SELECT 'Email verification disabled successfully - All users marked as verified (V2)' as resultado;
