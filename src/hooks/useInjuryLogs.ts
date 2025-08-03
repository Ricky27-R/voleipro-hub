import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InjuryLog {
  id: string;
  player_id: string;
  injury_date: string;
  description: string;
  recovery_status: 'recovering' | 'recovered' | 'chronic';
  expected_recovery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useInjuryLogs = (playerId?: string) => {
  const [injuryLogs, setInjuryLogs] = useState<InjuryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInjuryLogs = async () => {
    if (!playerId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('injury_logs')
        .select('*')
        .eq('player_id', playerId)
        .order('injury_date', { ascending: false });

      if (error) throw error;
      setInjuryLogs((data || []) as InjuryLog[]);
    } catch (error) {
      console.error('Error fetching injury logs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los registros médicos",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInjuryLog = async (injuryData: Omit<InjuryLog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('injury_logs')
        .insert([injuryData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Registro médico creado exitosamente",
      });

      await fetchInjuryLogs();
      return data;
    } catch (error: any) {
      console.error('Error creating injury log:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear el registro médico",
      });
      throw error;
    }
  };

  const updateInjuryLog = async (injuryId: string, injuryData: Partial<Omit<InjuryLog, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('injury_logs')
        .update(injuryData)
        .eq('id', injuryId)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Registro médico actualizado exitosamente",
      });

      await fetchInjuryLogs();
      return data;
    } catch (error: any) {
      console.error('Error updating injury log:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el registro médico",
      });
      throw error;
    }
  };

  const deleteInjuryLog = async (injuryId: string) => {
    try {
      const { error } = await supabase
        .from('injury_logs')
        .delete()
        .eq('id', injuryId);

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Registro médico eliminado exitosamente",
      });

      await fetchInjuryLogs();
    } catch (error: any) {
      console.error('Error deleting injury log:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el registro médico",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInjuryLogs();
  }, [playerId]);

  return {
    injuryLogs,
    loading,
    createInjuryLog,
    updateInjuryLog,
    deleteInjuryLog,
    refetch: fetchInjuryLogs
  };
};