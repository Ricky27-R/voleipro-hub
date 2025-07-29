-- Crear tabla clubs
CREATE TABLE public.clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  logo_url TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Un usuario solo puede tener un club
);

-- Habilitar RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo el dueño puede ver y modificar su club
CREATE POLICY "Users can view their own club" 
ON public.clubs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own club" 
ON public.clubs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own club" 
ON public.clubs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own club" 
ON public.clubs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();