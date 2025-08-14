-- Migración para crear tablas de estadísticas
-- Fecha: 2025-08-13

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('match', 'training', 'scrimmage')),
  title TEXT NOT NULL,
  opponent TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  location TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de sets
CREATE TABLE IF NOT EXISTS public.sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  team_score INTEGER DEFAULT 0,
  opp_score INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de acciones
CREATE TABLE IF NOT EXISTS public.actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES public.sets(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('serve', 'pass', 'set', 'attack', 'block', 'dig', 'free', 'error')),
  result TEXT NOT NULL CHECK (result IN ('point', 'error', 'continue')),
  zone INTEGER CHECK (zone >= 1 AND zone <= 9),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de jugadores (si no existe)
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT CHECK (position IN ('setter', 'outside_hitter', 'middle_blocker', 'opposite_hitter', 'libero', 'defensive_specialist')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_sessions_club_id ON public.sessions(club_id);
CREATE INDEX IF NOT EXISTS idx_sessions_team_id ON public.sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.sessions(date);
CREATE INDEX IF NOT EXISTS idx_sets_session_id ON public.sets(session_id);
CREATE INDEX IF NOT EXISTS idx_actions_session_id ON public.actions(session_id);
CREATE INDEX IF NOT EXISTS idx_actions_set_id ON public.actions(set_id);
CREATE INDEX IF NOT EXISTS idx_actions_timestamp ON public.actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);

-- Políticas RLS para sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions from their club" ON public.sessions
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions for their club" ON public.sessions
  FOR INSERT WITH CHECK (
    club_id IN (
      SELECT club_id FROM public.profiles WHERE id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can update sessions from their club" ON public.sessions
  FOR UPDATE USING (
    club_id IN (
      SELECT club_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sessions from their club" ON public.sessions
  FOR DELETE USING (
    club_id IN (
      SELECT club_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Políticas RLS para sets
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sets from their club sessions" ON public.sets
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE club_id IN (
        SELECT club_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage sets for their club sessions" ON public.sets
  FOR ALL USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE club_id IN (
        SELECT club_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Políticas RLS para actions
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view actions from their club sessions" ON public.actions
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE club_id IN (
        SELECT club_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create actions for their club sessions" ON public.actions
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE club_id IN (
        SELECT club_id FROM public.profiles WHERE id = auth.uid()
      )
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can update actions from their club sessions" ON public.actions
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE club_id IN (
        SELECT club_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete actions from their club sessions" ON public.actions
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE club_id IN (
        SELECT club_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Políticas RLS para players
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view players from their club teams" ON public.players
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE club_id IN (
        SELECT club_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage players for their club teams" ON public.players
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams WHERE club_id IN (
        SELECT club_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Comentarios para documentar las tablas
COMMENT ON TABLE public.sessions IS 'Sesiones de voleibol (partidos, entrenamientos, amistosos)';
COMMENT ON TABLE public.sets IS 'Sets individuales dentro de una sesión';
COMMENT ON TABLE public.actions IS 'Acciones individuales registradas durante un set';
COMMENT ON TABLE public.players IS 'Jugadores de los equipos';
