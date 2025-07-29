import { useState, useEffect } from 'react';
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

export const useTeams = (clubId?: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async () => {
    if (!clubId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('club_id', clubId)
        .order('categoria', { ascending: true })
        .order('año', { ascending: false });

      if (error) throw error;
      setTeams((data || []) as Team[]);
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();

      if (error) throw error;
      
      setTeams(prev => [...prev, data as Team]);
      toast({
        title: "¡Éxito!",
        description: "Equipo creado correctamente",
      });
      return data;
    } catch (error: any) {
      console.error('Error al crear equipo:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el equipo",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, teamData: Partial<Omit<Team, 'id' | 'club_id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(teamData)
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;
      
      setTeams(prev => prev.map(team => team.id === teamId ? (data as Team) : team));
      toast({
        title: "¡Éxito!",
        description: "Equipo actualizado correctamente",
      });
      return data;
    } catch (error: any) {
      console.error('Error al actualizar equipo:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el equipo",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      
      setTeams(prev => prev.filter(team => team.id !== teamId));
      toast({
        title: "¡Éxito!",
        description: "Equipo eliminado correctamente",
      });
    } catch (error: any) {
      console.error('Error al eliminar equipo:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el equipo",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [clubId]);

  return {
    teams,
    loading,
    createTeam,
    updateTeam,
    deleteTeam,
    refetch: fetchTeams,
  };
};