-- Add new roles to the enum
ALTER TYPE user_role ADD VALUE 'admin';
ALTER TYPE user_role ADD VALUE 'entrenador_principal_pending';

-- Update the default role for new users
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'entrenador_principal_pending'::user_role;

-- Update the handle_new_user function to use the new default role
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
    'entrenador_principal_pending'
  );
  RETURN new;
END;
$function$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$;

-- Create function to approve pending coaches
CREATE OR REPLACE FUNCTION public.approve_coach(coach_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins can approve coaches
  IF NOT is_admin() THEN
    RETURN false;
  END IF;
  
  -- Update the coach's role from pending to approved
  UPDATE public.profiles 
  SET role = 'entrenador_principal'
  WHERE id = coach_id AND role = 'entrenador_principal_pending';
  
  RETURN FOUND;
END;
$function$;

-- Update clubs policies to include admin access
DROP POLICY IF EXISTS "Users can create their own club" ON public.clubs;
CREATE POLICY "Approved coaches can create their own club" ON public.clubs
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND (
  SELECT role FROM public.profiles WHERE id = auth.uid()
) = 'entrenador_principal');

DROP POLICY IF EXISTS "Users can view their own club" ON public.clubs;
CREATE POLICY "Coaches and admins can view clubs" ON public.clubs
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR
  (id = (SELECT profiles.club_id FROM profiles WHERE profiles.id = auth.uid()))
);

DROP POLICY IF EXISTS "Users can update their own club" ON public.clubs;
CREATE POLICY "Approved coaches can update their own club" ON public.clubs
FOR UPDATE USING (auth.uid() = user_id AND (
  SELECT role FROM public.profiles WHERE id = auth.uid()
) = 'entrenador_principal');

DROP POLICY IF EXISTS "Users can delete their own club" ON public.clubs;
CREATE POLICY "Approved coaches can delete their own club" ON public.clubs
FOR DELETE USING (auth.uid() = user_id AND (
  SELECT role FROM public.profiles WHERE id = auth.uid()
) = 'entrenador_principal');

-- Update profiles policies to allow admins to view all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view own profile, admins can view all" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR 
  is_admin()
);

-- Allow admins to update any profile (for approvals)
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE USING (is_admin());

-- Update assistant_invitations policies to only allow approved coaches
DROP POLICY IF EXISTS "Club owners can create invitations" ON public.assistant_invitations;
CREATE POLICY "Approved club owners can create invitations" ON public.assistant_invitations
FOR INSERT 
WITH CHECK (
  is_club_owner(club_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

DROP POLICY IF EXISTS "Club owners can view their invitations" ON public.assistant_invitations;
CREATE POLICY "Approved club owners can view their invitations" ON public.assistant_invitations
FOR SELECT USING (
  is_club_owner(club_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

DROP POLICY IF EXISTS "Club owners can update their invitations" ON public.assistant_invitations;
CREATE POLICY "Approved club owners can update their invitations" ON public.assistant_invitations
FOR UPDATE USING (
  is_club_owner(club_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

DROP POLICY IF EXISTS "Club owners can delete their invitations" ON public.assistant_invitations;
CREATE POLICY "Approved club owners can delete their invitations" ON public.assistant_invitations
FOR DELETE USING (
  is_club_owner(club_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

-- Update teams policies to only allow approved coaches
DROP POLICY IF EXISTS "Club owners can create teams for their club" ON public.teams;
CREATE POLICY "Approved club owners can create teams for their club" ON public.teams
FOR INSERT 
WITH CHECK (
  is_club_owner(club_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

DROP POLICY IF EXISTS "Club owners can update their teams" ON public.teams;
CREATE POLICY "Approved club owners can update their teams" ON public.teams
FOR UPDATE USING (
  is_club_owner(club_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

DROP POLICY IF EXISTS "Club owners can delete their teams" ON public.teams;
CREATE POLICY "Approved club owners can delete their teams" ON public.teams
FOR DELETE USING (
  is_club_owner(club_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

-- Update players policies to only allow approved coaches
DROP POLICY IF EXISTS "Club owners can create players for their teams" ON public.players;
CREATE POLICY "Approved club owners can create players for their teams" ON public.players
FOR INSERT 
WITH CHECK (
  is_team_club_owner(team_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

DROP POLICY IF EXISTS "Club owners can update players of their teams" ON public.players;
CREATE POLICY "Approved club owners can update players of their teams" ON public.players
FOR UPDATE USING (
  is_team_club_owner(team_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);

DROP POLICY IF EXISTS "Club owners can delete players of their teams" ON public.players;
CREATE POLICY "Approved club owners can delete players of their teams" ON public.players
FOR DELETE USING (
  is_team_club_owner(team_id) AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'entrenador_principal'
);