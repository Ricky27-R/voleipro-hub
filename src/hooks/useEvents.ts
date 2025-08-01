import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:organizer_id (
            first_name,
            last_name
          ),
          clubs:organizer_club_id (
            nombre
          )
        `)
        .eq('status', 'active')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: any) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Get user's club_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('club_id')
        .eq('id', user.id)
        .single();

      if (!profile?.club_id) throw new Error('Usuario no tiene club asignado');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          organizer_id: user.id,
          organizer_club_id: profile.club_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear evento: ' + error.message);
    },
  });
};

export const useEventRegistrations = (eventId: string) => {
  return useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          teams (
            nombre,
            categoria,
            clubs (
              nombre
            )
          ),
          profiles:registering_coach_id (
            first_name,
            last_name
          )
        `)
        .eq('event_id', eventId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};

export const useRegisterTeam = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ eventId, teamId, questions }: { eventId: string; teamId: string; questions?: string }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          team_id: teamId,
          registering_coach_id: user.id,
          questions,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', variables.eventId] });
      toast.success('Equipo registrado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al registrar equipo: ' + error.message);
    },
  });
};

export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, status, notes }: { registrationId: string; status: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .update({
          status,
          organizer_notes: notes,
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', data.event_id] });
      toast.success('Estado de registro actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar registro: ' + error.message);
    },
  });
};