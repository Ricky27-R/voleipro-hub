import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Invitation {
  id: string;
  email: string;
  code: string;
  club_id: string;
  created_at: string;
  accepted: boolean;
}

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assistant_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error al obtener invitaciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las invitaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (email: string, clubId: string) => {
    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { data, error } = await supabase
        .from('assistant_invitations')
        .insert([{ email, code, club_id: clubId }])
        .select()
        .single();

      if (error) throw error;
      
      setInvitations(prev => [data, ...prev]);
      toast({
        title: "¡Éxito!",
        description: `Invitación creada. Código: ${code}`,
      });
      return data;
    } catch (error: any) {
      console.error('Error al crear invitación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la invitación",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('assistant_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
      
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      toast({
        title: "¡Éxito!",
        description: "Invitación eliminada correctamente",
      });
    } catch (error: any) {
      console.error('Error al eliminar invitación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la invitación",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (code: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_code: code,
        user_id: user.id
      });

      if (error) throw error;
      if (!data) throw new Error('Código de invitación inválido o ya usado');
      
      toast({
        title: "¡Éxito!",
        description: "Te has unido al club como asistente",
      });
      return true;
    } catch (error: any) {
      console.error('Error al aceptar invitación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo aceptar la invitación",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return {
    invitations,
    loading,
    createInvitation,
    deleteInvitation,
    acceptInvitation,
    refetch: fetchInvitations,
  };
};