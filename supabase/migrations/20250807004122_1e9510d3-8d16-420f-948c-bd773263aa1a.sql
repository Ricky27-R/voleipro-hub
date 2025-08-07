-- Create RPC functions for score management
CREATE OR REPLACE FUNCTION public.increment_team_score(p_set_id uuid, p_team_id uuid)
RETURNS void AS $$
DECLARE
    session_club_id uuid;
BEGIN
    -- Get the session's club_id to determine if it's our team or opponent
    SELECT s.club_id INTO session_club_id
    FROM sets st
    JOIN sessions s ON s.id = st.session_id
    WHERE st.id = p_set_id;
    
    -- Check if this team belongs to the session's club
    IF EXISTS (SELECT 1 FROM teams WHERE id = p_team_id AND club_id = session_club_id) THEN
        -- It's our team, increment team_score
        UPDATE sets 
        SET team_score = team_score + 1,
            updated_at = now()
        WHERE id = p_set_id;
    ELSE
        -- It's the opponent, increment opp_score
        UPDATE sets 
        SET opp_score = opp_score + 1,
            updated_at = now()
        WHERE id = p_set_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.decrement_team_score(p_set_id uuid, p_team_id uuid)
RETURNS void AS $$
DECLARE
    session_club_id uuid;
BEGIN
    -- Get the session's club_id to determine if it's our team or opponent
    SELECT s.club_id INTO session_club_id
    FROM sets st
    JOIN sessions s ON s.id = st.session_id
    WHERE st.id = p_set_id;
    
    -- Check if this team belongs to the session's club
    IF EXISTS (SELECT 1 FROM teams WHERE id = p_team_id AND club_id = session_club_id) THEN
        -- It's our team, decrement team_score (but not below 0)
        UPDATE sets 
        SET team_score = GREATEST(team_score - 1, 0),
            updated_at = now()
        WHERE id = p_set_id;
    ELSE
        -- It's the opponent, decrement opp_score (but not below 0)
        UPDATE sets 
        SET opp_score = GREATEST(opp_score - 1, 0),
            updated_at = now()
        WHERE id = p_set_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';