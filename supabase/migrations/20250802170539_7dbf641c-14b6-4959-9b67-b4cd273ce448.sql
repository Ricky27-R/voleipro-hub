-- Agregar foreign keys necesarias para las relaciones en events
ALTER TABLE events 
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE events 
ADD CONSTRAINT events_organizer_club_id_fkey 
FOREIGN KEY (organizer_club_id) REFERENCES clubs(id) ON DELETE CASCADE;