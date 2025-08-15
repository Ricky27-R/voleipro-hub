-- CORRECCIÓN: Entrenadores principales NO requieren aprobación
-- Este script corrige el flujo para que entrenadores principales vayan directo al dashboard
-- Fecha: 2025-01-15

-- 1. Restaurar el rol por defecto para nuevos usuarios
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'entrenador_principal'::user_role;

-- 2. Actualizar la función handle_new_user para crear usuarios como entrenador_principal por defecto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'entrenador_principal'  -- Por defecto: entrenador principal SIN necesidad de aprobación
  );
  RETURN new;
END;
$function$;

-- 3. Actualizar usuarios existentes que estén en 'entrenador_principal_pending' a 'entrenador_principal'
-- (Solo aquellos que NO tienen un club_id, lo que indica que son entrenadores principales originales)
UPDATE public.profiles 
SET role = 'entrenador_principal' 
WHERE role = 'entrenador_principal_pending' 
  AND club_id IS NULL;

-- 4. Actualizar la política de creación de club para permitir a entrenadores principales directamente
DROP POLICY IF EXISTS "Approved coaches can create their own club" ON public.clubs;
CREATE POLICY "Entrenadores principales can create their own club" ON public.clubs
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND (
  SELECT role FROM public.profiles WHERE id = auth.uid()
) = 'entrenador_principal');

COMMENT ON POLICY "Entrenadores principales can create their own club" ON public.clubs IS 
'Permite a entrenadores principales crear su club sin requerir aprobación de admin';

-- Mensaje de confirmación
SELECT 'Corrección aplicada exitosamente: Entrenadores principales ya no requieren aprobación' as resultado;
