-- Create ENUMs for the stats system (skip if exists)
DO $$ BEGIN
    CREATE TYPE public.session_type AS ENUM ('match', 'training', 'scrimmage');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.action_type AS ENUM ('serve', 'pass', 'set', 'attack', 'block', 'dig', 'free', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.action_result AS ENUM ('point', 'error', 'continue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.dominant_hand AS ENUM ('right', 'left', 'ambidextrous');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create sessions table
CREATE TABLE public.sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id UUID NOT NULL,
    type session_type NOT NULL,
    title TEXT NOT NULL,
    opponent TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sets table
CREATE TABLE public.sets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    team_score INTEGER NOT NULL DEFAULT 0,
    opp_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(session_id, set_number)
);

-- Create actions table
CREATE TABLE public.actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES public.sets(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    action_type action_type NOT NULL,
    result action_result NOT NULL,
    zone INTEGER CHECK (zone >= 1 AND zone <= 9),
    created_by UUID NOT NULL,
    synced BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new fields to players table (only if they don't exist)
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS dominant_hand dominant_hand,
ADD COLUMN IF NOT EXISTS approach_jump_cm INTEGER,
ADD COLUMN IF NOT EXISTS block_jump_cm INTEGER;

-- Create materialized view for player stats
CREATE MATERIALIZED VIEW public.player_stats AS
WITH player_actions AS (
    SELECT 
        p.id as player_id,
        p.full_name,
        p.team_id,
        s.type as session_type,
        a.action_type,
        a.result,
        COUNT(*) as action_count
    FROM players p
    LEFT JOIN actions a ON p.id = a.player_id
    LEFT JOIN sessions s ON a.session_id = s.id
    GROUP BY p.id, p.full_name, p.team_id, s.type, a.action_type, a.result
),
serve_stats AS (
    SELECT 
        player_id,
        session_type,
        SUM(CASE WHEN action_type = 'serve' AND result = 'point' THEN action_count ELSE 0 END) as serve_points,
        SUM(CASE WHEN action_type = 'serve' AND result = 'error' THEN action_count ELSE 0 END) as serve_errors,
        SUM(CASE WHEN action_type = 'serve' THEN action_count ELSE 0 END) as total_serves
    FROM player_actions
    GROUP BY player_id, session_type
),
attack_stats AS (
    SELECT 
        player_id,
        session_type,
        SUM(CASE WHEN action_type = 'attack' AND result = 'point' THEN action_count ELSE 0 END) as attack_kills,
        SUM(CASE WHEN action_type = 'attack' AND result = 'error' THEN action_count ELSE 0 END) as attack_errors,
        SUM(CASE WHEN action_type = 'attack' THEN action_count ELSE 0 END) as total_attacks
    FROM player_actions
    GROUP BY player_id, session_type
),
defensive_stats AS (
    SELECT 
        player_id,
        session_type,
        SUM(CASE WHEN action_type = 'dig' THEN action_count ELSE 0 END) as digs,
        SUM(CASE WHEN action_type = 'block' AND result = 'point' THEN action_count ELSE 0 END) as blocks
    FROM player_actions
    GROUP BY player_id, session_type
)
SELECT 
    p.id as player_id,
    p.full_name,
    p.team_id,
    COALESCE(pa.session_type, 'match') as session_type,
    -- Serve efficiency
    CASE 
        WHEN COALESCE(ss.total_serves, 0) = 0 THEN 0 
        ELSE ROUND((COALESCE(ss.serve_points, 0) * 100.0) / COALESCE(ss.total_serves, 1), 2)
    END as serve_eff,
    -- Attack percentage
    CASE 
        WHEN COALESCE(ats.total_attacks, 0) = 0 THEN 0 
        ELSE ROUND(((COALESCE(ats.attack_kills, 0) - COALESCE(ats.attack_errors, 0)) * 100.0) / COALESCE(ats.total_attacks, 1), 2)
    END as hitting_pct,
    -- Defensive stats
    COALESCE(ds.digs, 0) as digs,
    COALESCE(ds.blocks, 0) as blocks
FROM players p
LEFT JOIN player_actions pa ON p.id = pa.player_id
LEFT JOIN serve_stats ss ON p.id = ss.player_id AND COALESCE(pa.session_type, 'match') = ss.session_type
LEFT JOIN attack_stats ats ON p.id = ats.player_id AND COALESCE(pa.session_type, 'match') = ats.session_type
LEFT JOIN defensive_stats ds ON p.id = ds.player_id AND COALESCE(pa.session_type, 'match') = ds.session_type
GROUP BY p.id, p.full_name, p.team_id, pa.session_type, ss.serve_points, ss.serve_errors, ss.total_serves, 
         ats.attack_kills, ats.attack_errors, ats.total_attacks, ds.digs, ds.blocks;

-- Create index for better performance
CREATE INDEX idx_player_stats_player_id ON public.player_stats(player_id);
CREATE INDEX idx_player_stats_team_id ON public.player_stats(team_id);
CREATE INDEX idx_actions_session_id ON public.actions(session_id);
CREATE INDEX idx_actions_player_id ON public.actions(player_id);
CREATE INDEX idx_actions_ts ON public.actions(ts);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Club coaches can view their sessions" 
ON public.sessions FOR SELECT 
USING (
    club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    OR auth.uid() = created_by
);

CREATE POLICY "Club coaches can create sessions" 
ON public.sessions FOR INSERT 
WITH CHECK (
    club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    AND auth.uid() = created_by
);

CREATE POLICY "Club coaches can update their sessions" 
ON public.sessions FOR UPDATE 
USING (
    club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    OR auth.uid() = created_by
);

CREATE POLICY "Club coaches can delete their sessions" 
ON public.sessions FOR DELETE 
USING (
    club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    OR auth.uid() = created_by
);

-- RLS Policies for sets
CREATE POLICY "Club coaches can view sets of their sessions" 
ON public.sets FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM sessions s 
        WHERE s.id = sets.session_id 
        AND (s.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()) OR s.created_by = auth.uid())
    )
);

CREATE POLICY "Club coaches can create sets for their sessions" 
ON public.sets FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM sessions s 
        WHERE s.id = sets.session_id 
        AND (s.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()) OR s.created_by = auth.uid())
    )
);

CREATE POLICY "Club coaches can update sets of their sessions" 
ON public.sets FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM sessions s 
        WHERE s.id = sets.session_id 
        AND (s.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()) OR s.created_by = auth.uid())
    )
);

CREATE POLICY "Club coaches can delete sets of their sessions" 
ON public.sets FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM sessions s 
        WHERE s.id = sets.session_id 
        AND (s.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()) OR s.created_by = auth.uid())
    )
);

-- RLS Policies for actions
CREATE POLICY "Club coaches can view actions of their sessions" 
ON public.actions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM sessions s 
        WHERE s.id = actions.session_id 
        AND (s.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()) OR s.created_by = auth.uid())
    )
);

CREATE POLICY "Club coaches can create actions for their sessions" 
ON public.actions FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM sessions s 
        WHERE s.id = actions.session_id 
        AND (s.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()) OR s.created_by = auth.uid())
    )
    AND auth.uid() = created_by
);

CREATE POLICY "Club coaches can update actions of their sessions" 
ON public.actions FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM sessions s 
        WHERE s.id = actions.session_id 
        AND (s.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()) OR s.created_by = auth.uid())
    )
    AND auth.uid() = created_by
);

CREATE POLICY "Club coaches can delete actions of their sessions" 
ON public.actions FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM sessions s 
        WHERE s.id = actions.session_id 
        AND (s.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()) OR s.created_by = auth.uid())
    )
    AND auth.uid() = created_by
);

-- Create trigger to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.player_stats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Trigger on actions table
CREATE TRIGGER refresh_player_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.actions
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_player_stats();

-- Add updated_at triggers
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sets_updated_at
    BEFORE UPDATE ON public.sets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();