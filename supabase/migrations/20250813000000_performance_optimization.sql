-- Performance optimization indexes for events system
-- This migration adds indexes to improve query performance

-- Index for events table - status and date (most common query)
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events (status, date);

-- Index for events table - city (for filtering)
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events (city);

-- Index for events table - event_type (for filtering)
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events (event_type);

-- Index for events table - organizer_club_id (for club filtering)
CREATE INDEX IF NOT EXISTS idx_events_organizer_club ON public.events (organizer_club_id);

-- Index for event_registrations table - event_id (most common query)
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations (event_id);

-- Index for event_registrations table - team_id (for team lookups)
CREATE INDEX IF NOT EXISTS idx_event_registrations_team_id ON public.event_registrations (team_id);

-- Index for event_registrations table - status (for filtering)
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations (status);

-- Index for event_chat_messages table - event_id and created_at (for chat ordering)
CREATE INDEX IF NOT EXISTS idx_event_chat_event_created ON public.event_chat_messages (event_id, created_at);

-- Index for profiles table - club_id (for organizer lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_club_id ON public.profiles (club_id);

-- Index for teams table - club_id (for team filtering)
CREATE INDEX IF NOT EXISTS idx_teams_club_id ON public.teams (club_id);

-- Composite index for events - status, date, and city (for complex filtering)
CREATE INDEX IF NOT EXISTS idx_events_status_date_city ON public.events (status, date, city);

-- Partial index for active events only (most common case)
CREATE INDEX IF NOT EXISTS idx_events_active_only ON public.events (date, city, event_type) 
WHERE status = 'active';

-- Analyze tables to update statistics
ANALYZE public.events;
ANALYZE public.event_registrations;
ANALYZE public.event_chat_messages;
ANALYZE public.profiles;
ANALYZE public.teams;
