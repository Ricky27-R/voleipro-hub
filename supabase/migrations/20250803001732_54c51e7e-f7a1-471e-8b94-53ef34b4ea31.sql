-- Fix security issue: Set search_path for functions to prevent search path injection
ALTER FUNCTION public.is_admin() SET search_path = 'public';
ALTER FUNCTION public.is_club_owner(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_team_club_owner(uuid) SET search_path = 'public';
ALTER FUNCTION public.approve_coach(uuid) SET search_path = 'public';
ALTER FUNCTION public.generate_club_code(text) SET search_path = 'public';
ALTER FUNCTION public.accept_invitation(text, uuid) SET search_path = 'public';
ALTER FUNCTION public.approve_assistant_request(uuid) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';