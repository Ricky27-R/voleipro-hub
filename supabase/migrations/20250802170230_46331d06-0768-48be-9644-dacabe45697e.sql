-- Actualizar los perfiles para asociar el club_id correcto
UPDATE profiles 
SET club_id = clubs.id 
FROM clubs 
WHERE profiles.id = clubs.user_id AND profiles.club_id IS NULL;

-- Agregar constraint único necesario para la tabla club_invitation_codes
ALTER TABLE club_invitation_codes 
ADD CONSTRAINT club_invitation_codes_club_id_key UNIQUE (club_id);