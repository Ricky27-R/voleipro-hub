-- Create assistant invitations table
CREATE TABLE public.assistant_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  club_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT fk_assistant_invitations_club FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.assistant_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for assistant invitations
CREATE POLICY "Club owners can create invitations" 
ON public.assistant_invitations 
FOR INSERT 
WITH CHECK (is_club_owner(club_id));

CREATE POLICY "Club owners can view their invitations" 
ON public.assistant_invitations 
FOR SELECT 
USING (is_club_owner(club_id));

CREATE POLICY "Club owners can update their invitations" 
ON public.assistant_invitations 
FOR UPDATE 
USING (is_club_owner(club_id));

CREATE POLICY "Club owners can delete their invitations" 
ON public.assistant_invitations 
FOR DELETE 
USING (is_club_owner(club_id));

-- Create policy for assistants to view invitations by code (for registration)
CREATE POLICY "Anyone can view invitation by code" 
ON public.assistant_invitations 
FOR SELECT 
USING (true);

-- Create function to accept invitation and link assistant to club
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_code TEXT, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record assistant_invitations%ROWTYPE;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record 
  FROM assistant_invitations 
  WHERE code = invitation_code AND accepted = false;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update user profile to assistant role and link to club
  INSERT INTO profiles (id, email, role, club_id)
  VALUES (user_id, invitation_record.email, 'asistente', invitation_record.club_id)
  ON CONFLICT (id) 
  DO UPDATE SET role = 'asistente', club_id = invitation_record.club_id;
  
  -- Mark invitation as accepted
  UPDATE assistant_invitations 
  SET accepted = true 
  WHERE id = invitation_record.id;
  
  RETURN true;
END;
$$;

-- Add club_id to profiles table for assistants
ALTER TABLE public.profiles ADD COLUMN club_id UUID REFERENCES public.clubs(id);

-- Create policy for assistants to view their club data
CREATE POLICY "Club assistants can view their club" 
ON public.clubs 
FOR SELECT 
USING (id = (SELECT club_id FROM profiles WHERE id = auth.uid()));

-- Update teams policies to allow assistants
CREATE POLICY "Club assistants can view their club teams" 
ON public.teams 
FOR SELECT 
USING (club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()));

-- Update players policies to allow assistants
CREATE POLICY "Club assistants can view their club players" 
ON public.players 
FOR SELECT 
USING (is_team_club_owner(team_id) OR EXISTS (
  SELECT 1 FROM teams t 
  WHERE t.id = team_id 
  AND t.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
));