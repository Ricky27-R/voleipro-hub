import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Player {
  id: string;
  full_name: string;
  document_id: string;
  birthdate: string;
  position: 'Setter' | 'Libero' | 'Middle Blocker' | 'Outside Hitter' | 'Opposite';
  team_id: string;
  created_at: string;
  updated_at: string;
}

export const usePlayers = (teamId?: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('players')
        .select('*')
        .order('full_name');

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching players:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las jugadoras",
        });
        return;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las jugadoras",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlayer = async (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) {
        console.error('Error creating player:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear la jugadora",
        });
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Jugadora creada exitosamente",
      });

      await fetchPlayers();
      return data;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  };

  const updatePlayer = async (playerId: string, playerData: Partial<Omit<Player, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', playerId)
        .select()
        .single();

      if (error) {
        console.error('Error updating player:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar la jugadora",
        });
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Jugadora actualizada exitosamente",
      });

      await fetchPlayers();
      return data;
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) {
        console.error('Error deleting player:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la jugadora",
        });
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Jugadora eliminada exitosamente",
      });

      await fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [teamId]);

  return {
    players,
    loading,
    createPlayer,
    updatePlayer,
    deletePlayer,
    refetch: fetchPlayers
  };
};