import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Hook de prueba para verificar la conexión
export const useTestConnection = () => {
  return useQuery({
    queryKey: ['test-connection'],
    queryFn: async () => {
      try {
        // Prueba simple de conexión
        const { data, error } = await supabase
          .from('events')
          .select('count')
          .limit(1);
        
        if (error) {
          throw error;
        }
        
        return { success: true, data };
      } catch (error) {
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        // Primero obtenemos solo los eventos básicos
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            name,
            event_type,
            description,
            date,
            location,
            city,
            benefits,
            status,
            max_participants,
            registration_deadline,
            organizer_id,
            organizer_club_id,
            created_at,
            updated_at
          `)
          .eq('status', 'active')
          .order('date', { ascending: true });
        
        if (eventsError) {
          throw eventsError;
        }
        
        // Luego obtenemos los datos del organizador y club por separado
        if (events && events.length > 0) {
          const organizerIds = [...new Set(events.map(e => e.organizer_id))];
          const clubIds = [...new Set(events.map(e => e.organizer_club_id))];
          
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', organizerIds);
          
          const { data: clubs } = await supabase
            .from('clubs')
            .select('id, nombre')
            .in('id', clubIds);
          
          // Combinamos los datos
          const enrichedEvents = events.map(event => ({
            ...event,
            organizer: profiles?.find(p => p.id === event.organizer_id),
            organizer_club: clubs?.find(c => c.id === event.organizer_club_id),
          }));
          
          return enrichedEvents;
        }
        
        return [];
      } catch (error) {
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: any) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Get user's club_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('club_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error getting profile:', profileError);
        throw new Error('No se pudo obtener el perfil del usuario');
      }

      if (!profile?.club_id) {
        throw new Error('Usuario no tiene club asignado');
      }

      const eventToCreate = {
        ...eventData,
        organizer_id: user.id,
        organizer_club_id: profile.club_id,
        status: 'active',
      };

      const { data, error } = await supabase
        .from('events')
        .insert(eventToCreate)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento creado exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al crear evento: ' + (error.message || 'Error desconocido'));
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
          id,
          event_id,
          team_id,
          registering_coach_id,
          status,
          registration_date,
          questions,
          organizer_notes,
          created_at,
          updated_at,
          teams (
            id,
            nombre,
            categoria,
            año,
            club_id,
            clubs!teams_club_id_fkey (
              id,
              nombre
            )
          ),
          profiles:registering_coach_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('event_id', eventId)
        .order('registration_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
          status: 'pending',
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
    onError: (error: any) => {
      toast.error('Error al registrar equipo: ' + (error.message || 'Error desconocido'));
    },
  });
};

export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, status, notes }: { registrationId: string; status: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select()
        .eq('id', registrationId)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', data.event_id] });
      toast.success('Estado de registro actualizado');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar registro: ' + (error.message || 'Error desconocido'));
    },
  });
};