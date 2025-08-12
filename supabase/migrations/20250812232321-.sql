-- Fix: assistant_invitations publicly readable by anyone
-- Remove overly permissive policy and add safe validator RPC
DROP POLICY IF EXISTS "Anyone can view invitation by code" ON public.assistant_invitations;

-- Ensure RLS enabled
ALTER TABLE public.assistant_invitations ENABLE ROW LEVEL SECURITY;

-- Optional helper: validate invitation code without exposing emails
CREATE OR REPLACE FUNCTION public.validate_assistant_invitation(p_code text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assistant_invitations
    WHERE code = p_code AND accepted = false
  )
$$;