/*
  # Fix Assistant Invitation System

  1. Database Issues
    - Fix RLS policies for assistant_requests table
    - Ensure proper foreign key relationships
    - Fix the create_assistant_request_by_code function

  2. Security
    - Proper RLS policies for viewing and creating assistant requests
    - Secure validation of invitation codes

  3. Data Integrity
    - Ensure assistant requests are properly created and visible
*/

-- Fix the create_assistant_request_by_code function
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
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Find the invitation code
  SELECT * INTO code_rec
  FROM public.club_invitation_codes
  WHERE code = p_code
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código de invitación inválido';
  END IF;

  -- Get user profile
  SELECT * INTO prof
  FROM public.profiles
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil de usuario no encontrado';
  END IF;

  -- Check if user already has a pending request for this club
  IF EXISTS (
    SELECT 1 FROM public.assistant_requests
    WHERE user_id = auth.uid() AND club_id = code_rec.club_id AND status = 'pending'
  ) THEN
    RETURN true; -- Already has pending request
  END IF;

  -- Create the assistant request
  INSERT INTO public.assistant_requests (
    user_id, 
    email, 
    first_name, 
    last_name, 
    club_id, 
    status
  )
  VALUES (
    auth.uid(), 
    prof.email, 
    prof.first_name, 
    prof.last_name, 
    code_rec.club_id, 
    'pending'
  );

  RETURN true;
END;
$function$;

-- Fix RLS policies for assistant_requests
DROP POLICY IF EXISTS "Club owners can view requests for their club" ON public.assistant_requests;
DROP POLICY IF EXISTS "Club owners can update requests for their club" ON public.assistant_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.assistant_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.assistant_requests;

-- Create proper RLS policies
CREATE POLICY "Club owners can view requests for their club" 
ON public.assistant_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE id = assistant_requests.club_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Club owners can update requests for their club" 
ON public.assistant_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE id = assistant_requests.club_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create assistant requests" 
ON public.assistant_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests" 
ON public.assistant_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure the table has proper constraints
ALTER TABLE public.assistant_requests 
DROP CONSTRAINT IF EXISTS assistant_requests_user_id_fkey;

ALTER TABLE public.assistant_requests 
ADD CONSTRAINT assistant_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.assistant_requests 
DROP CONSTRAINT IF EXISTS assistant_requests_club_id_fkey;

ALTER TABLE public.assistant_requests 
ADD CONSTRAINT assistant_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate pending requests
ALTER TABLE public.assistant_requests 
DROP CONSTRAINT IF EXISTS unique_pending_request_per_club;

ALTER TABLE public.assistant_requests 
ADD CONSTRAINT unique_pending_request_per_club 
UNIQUE (user_id, club_id, status) 
DEFERRABLE INITIALLY DEFERRED;