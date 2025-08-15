import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Player {
  id: string;
  full_name: string;
  document_id: string;
  birthdate: string;
  position: 'Setter' | 'Libero' | 'Middle Blocker' | 'Outside Hitter' | 'Opposite';
  team_id: string;
  jersey_number?: number;
  height_cm?: number;
  weight_kg?: number;
  reach_cm?: number;
  jump_cm?: number;
  allergies?: string;
  created_at: string;
  updated_at: string;
}

// Fetch players for a team or all players
const fetchPlayers = async (teamId?: string): Promise<Player[]> => {
  let query = supabase
    .from('players')
    .select('*')
    .order('full_name');

  if (teamId) {
    query = query.eq('team_id', teamId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const usePlayers = (teamId?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['players', teamId],
    queryFn: () => fetchPlayers(teamId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las jugadoras",
      });
    },
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) throw error;
      return data as Player;
    },
    onSuccess: (data) => {
      // Invalidate both team-specific and all players queries
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Éxito",
        description: "Jugadora creada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la jugadora",
      });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      playerId,
      playerData,
    }: {
      playerId: string;
      playerData: Partial<Omit<Player, 'id' | 'created_at' | 'updated_at'>>;
    }) => {
      const { data, error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', playerId)
        .select()
        .single();

      if (error) throw error;
      return data as Player;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Éxito",
        description: "Jugadora actualizada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la jugadora",
      });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (playerId: string) => {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
      return playerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Éxito",
        description: "Jugadora eliminada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la jugadora",
      });
    },
  });
};