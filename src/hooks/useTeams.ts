import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  club_id: string;
  nombre: string;
  categoria: 'U12' | 'U14' | 'U16' | 'U18' | 'U20' | 'Senior';
  año: number;
  created_at: string;
  updated_at: string;
}

// Fetch teams for a club
const fetchTeams = async (clubId: string): Promise<Team[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('club_id', clubId)
    .order('categoria', { ascending: true })
    .order('año', { ascending: false });

  if (error) throw error;
  return (data || []) as Team[];
};

export const useTeams = (clubId?: string) => {
  return useQuery({
    queryKey: ['teams', clubId],
    queryFn: () => fetchTeams(clubId!),
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();

      if (error) throw error;
      return data as Team;
    },
    onSuccess: (data) => {
      // Invalidate and refetch teams for this club
      queryClient.invalidateQueries({ queryKey: ['teams', data.club_id] });
      toast({
        title: "¡Éxito!",
        description: "Equipo creado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el equipo",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      teamId,
      teamData,
    }: {
      teamId: string;
      teamData: Partial<Omit<Team, 'id' | 'club_id' | 'created_at' | 'updated_at'>>;
    }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(teamData)
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;
      return data as Team;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams', data.club_id] });
      toast({
        title: "¡Éxito!",
        description: "Equipo actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el equipo",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teamId, clubId }: { teamId: string; clubId: string }) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      return { teamId, clubId };
    },
    onSuccess: ({ clubId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', clubId] });
      toast({
        title: "¡Éxito!",
        description: "Equipo eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el equipo",
        variant: "destructive",
      });
    },
  });
};