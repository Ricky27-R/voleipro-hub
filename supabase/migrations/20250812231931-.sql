-- Tighten access to invitation codes and add secure RPCs

-- 1) Remove overly permissive public read policy
DROP POLICY IF EXISTS "Anyone can view invitation codes" ON public.club_invitation_codes;

-- Ensure RLS remains enabled (should already be enabled)
ALTER TABLE public.club_invitation_codes ENABLE ROW LEVEL SECURITY;

-- 2) Provide a secure way to validate a code without exposing the table
CREATE OR REPLACE FUNCTION public.validate_club_code(p_code text)
RETURNS TABLE (club_id uuid, club_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT cic.club_id, c.nombre AS club_name
  FROM public.club_invitation_codes cic
  JOIN public.clubs c ON c.id = cic.club_id
  WHERE cic.code = p_code
  LIMIT 1
$$;

-- 3) Securely create an assistant request from a code
CREATE OR REPLACE FUNCTION public.create_assistant_request_by_code(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  code_rec public.club_invitation_codes%ROWTYPE;
  prof public.profiles%ROWTYPE;
BEGIN
  -- Require authenticated user
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO code_rec
  FROM public.club_invitation_codes
  WHERE code = p_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT * INTO prof
  FROM public.profiles
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Avoid duplicate pending requests for same club/user
  IF EXISTS (
    SELECT 1 FROM public.assistant_requests
    WHERE user_id = auth.uid() AND club_id = code_rec.club_id AND status = 'pending'
  ) THEN
    RETURN true;
  END IF;

  INSERT INTO public.assistant_requests (user_id, email, first_name, last_name, club_id, status)
  VALUES (auth.uid(), prof.email, prof.first_name, prof.last_name, code_rec.club_id, 'pending');

  RETURN true;
END;
$function$;