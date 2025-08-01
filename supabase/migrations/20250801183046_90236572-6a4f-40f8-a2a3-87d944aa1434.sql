-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  organizer_club_id UUID NOT NULL,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('tournament', 'tope')),
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  benefits TEXT[], -- Array of benefits like lodging, meals, etc.
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  max_participants INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  team_id UUID NOT NULL,
  registering_coach_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  questions TEXT,
  organizer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, team_id)
);

-- Create event_documents table
CREATE TABLE public.event_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_chat_messages table
CREATE TABLE public.event_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Anyone can view active events" 
ON public.events 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Coaches can create events for their club" 
ON public.events 
FOR INSERT 
WITH CHECK (
  auth.uid() = organizer_id AND 
  organizer_club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Organizers can update their events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = organizer_id);

-- RLS Policies for event_registrations
CREATE POLICY "Anyone can view registrations for events they can see" 
ON public.event_registrations 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND status = 'active') OR
  auth.uid() = registering_coach_id OR
  auth.uid() = (SELECT organizer_id FROM events WHERE id = event_id)
);

CREATE POLICY "Coaches can register their teams" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (
  auth.uid() = registering_coach_id AND
  team_id IN (SELECT id FROM teams WHERE club_id = (SELECT club_id FROM profiles WHERE id = auth.uid()))
);

CREATE POLICY "Registering coaches and organizers can update registrations" 
ON public.event_registrations 
FOR UPDATE 
USING (
  auth.uid() = registering_coach_id OR
  auth.uid() = (SELECT organizer_id FROM events WHERE id = event_id)
);

-- RLS Policies for event_documents
CREATE POLICY "Anyone can view documents for events they can see" 
ON public.event_documents 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM events WHERE id = event_id AND status = 'active'));

CREATE POLICY "Event organizers can manage documents" 
ON public.event_documents 
FOR ALL 
USING (auth.uid() = (SELECT organizer_id FROM events WHERE id = event_id))
WITH CHECK (auth.uid() = (SELECT organizer_id FROM events WHERE id = event_id));

-- RLS Policies for event_chat_messages
CREATE POLICY "Registered participants and organizers can view chat" 
ON public.event_chat_messages 
FOR SELECT 
USING (
  auth.uid() = (SELECT organizer_id FROM events WHERE id = event_id) OR
  auth.uid() IN (SELECT registering_coach_id FROM event_registrations WHERE event_id = event_chat_messages.event_id)
);

CREATE POLICY "Registered participants and organizers can send messages" 
ON public.event_chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND (
    auth.uid() = (SELECT organizer_id FROM events WHERE id = event_id) OR
    auth.uid() IN (SELECT registering_coach_id FROM event_registrations WHERE event_id = event_chat_messages.event_id)
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE public.events ADD CONSTRAINT fk_events_organizer 
  FOREIGN KEY (organizer_id) REFERENCES auth.users(id);

ALTER TABLE public.events ADD CONSTRAINT fk_events_organizer_club 
  FOREIGN KEY (organizer_club_id) REFERENCES public.clubs(id);

ALTER TABLE public.event_registrations ADD CONSTRAINT fk_registrations_event 
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

ALTER TABLE public.event_registrations ADD CONSTRAINT fk_registrations_team 
  FOREIGN KEY (team_id) REFERENCES public.teams(id);

ALTER TABLE public.event_registrations ADD CONSTRAINT fk_registrations_coach 
  FOREIGN KEY (registering_coach_id) REFERENCES auth.users(id);

ALTER TABLE public.event_documents ADD CONSTRAINT fk_documents_event 
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

ALTER TABLE public.event_documents ADD CONSTRAINT fk_documents_uploader 
  FOREIGN KEY (uploaded_by) REFERENCES auth.users(id);

ALTER TABLE public.event_chat_messages ADD CONSTRAINT fk_chat_event 
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

ALTER TABLE public.event_chat_messages ADD CONSTRAINT fk_chat_sender 
  FOREIGN KEY (sender_id) REFERENCES auth.users(id);