-- Create enum for player positions
CREATE TYPE public.player_position AS ENUM ('Setter', 'Libero', 'Middle Blocker', 'Outside Hitter', 'Opposite');

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  birthdate DATE NOT NULL,
  position player_position NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, team_id)
);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create function to check if user owns the club that owns the team
CREATE OR REPLACE FUNCTION public.is_team_club_owner(target_team_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.clubs c ON c.id = t.club_id
    WHERE t.id = target_team_id AND c.user_id = auth.uid()
  );
END;
$$;

-- Create RLS policies for players
CREATE POLICY "Club owners can view players of their teams"
ON public.players
FOR SELECT
USING (is_team_club_owner(team_id));

CREATE POLICY "Club owners can create players for their teams"
ON public.players
FOR INSERT
WITH CHECK (is_team_club_owner(team_id));

CREATE POLICY "Club owners can update players of their teams"
ON public.players
FOR UPDATE
USING (is_team_club_owner(team_id));

CREATE POLICY "Club owners can delete players of their teams"
ON public.players
FOR DELETE
USING (is_team_club_owner(team_id));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();