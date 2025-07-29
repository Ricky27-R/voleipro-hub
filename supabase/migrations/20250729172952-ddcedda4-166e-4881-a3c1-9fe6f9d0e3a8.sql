-- Crear tabla teams
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('U12', 'U14', 'U16', 'U18', 'U20', 'Senior')),
  año INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, nombre) -- Un club no puede tener equipos con el mismo nombre
);

-- Habilitar RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Función para verificar si el usuario es dueño del club
CREATE OR REPLACE FUNCTION public.is_club_owner(target_club_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE id = target_club_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Políticas RLS - Solo el dueño del club puede gestionar sus equipos
CREATE POLICY "Club owners can view their teams" 
ON public.teams 
FOR SELECT 
USING (public.is_club_owner(club_id));

CREATE POLICY "Club owners can create teams for their club" 
ON public.teams 
FOR INSERT 
WITH CHECK (public.is_club_owner(club_id));

CREATE POLICY "Club owners can update their teams" 
ON public.teams 
FOR UPDATE 
USING (public.is_club_owner(club_id));

CREATE POLICY "Club owners can delete their teams" 
ON public.teams 
FOR DELETE 
USING (public.is_club_owner(club_id));

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();