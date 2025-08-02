-- Add new columns to players table for physical and medical data
ALTER TABLE players ADD COLUMN IF NOT EXISTS jersey_number INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);
ALTER TABLE players ADD COLUMN IF NOT EXISTS reach_cm INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS jump_cm INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS allergies TEXT;

-- Create injury_logs table for medical history
CREATE TABLE IF NOT EXISTS injury_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  injury_date DATE NOT NULL,
  description TEXT NOT NULL,
  recovery_status TEXT NOT NULL DEFAULT 'recovering' CHECK (recovery_status IN ('recovering', 'recovered', 'chronic')),
  expected_recovery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on injury_logs
ALTER TABLE injury_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for injury_logs
CREATE POLICY "Club owners can view injury logs of their players" 
ON injury_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = injury_logs.player_id 
    AND is_club_owner(t.club_id)
  )
);

CREATE POLICY "Club assistants can view injury logs of their club players" 
ON injury_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = injury_logs.player_id 
    AND t.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Club owners can create injury logs for their players" 
ON injury_logs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = injury_logs.player_id 
    AND is_club_owner(t.club_id)
  )
);

CREATE POLICY "Club owners can update injury logs of their players" 
ON injury_logs FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = injury_logs.player_id 
    AND is_club_owner(t.club_id)
  )
);

CREATE POLICY "Club owners can delete injury logs of their players" 
ON injury_logs FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = injury_logs.player_id 
    AND is_club_owner(t.club_id)
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_injury_logs_updated_at
BEFORE UPDATE ON injury_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint for jersey numbers within a team
ALTER TABLE players ADD CONSTRAINT unique_jersey_per_team 
UNIQUE (team_id, jersey_number);