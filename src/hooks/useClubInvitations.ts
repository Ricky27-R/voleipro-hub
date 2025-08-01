import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ClubInvitationCode {
  id: string;
  club_id: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantRequest {
  id: string;
  club_id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useClubInvitations = () => {
  const [invitationCode, setInvitationCode] = useState<ClubInvitationCode | null>(null);
  const [assistantRequests, setAssistantRequests] = useState<AssistantRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvitationCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('club_invitation_codes')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setInvitationCode(data || null);
    } catch (error: any) {
      console.error('Error al obtener código de invitación:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el código de invitación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInvitationCode = async (clubId: string, clubName: string) => {
    setLoading(true);
    try {
      // Generar código usando la función de la base de datos
      const { data: generatedCode, error: codeError } = await supabase
        .rpc('generate_club_code', { club_name: clubName });

      if (codeError) throw codeError;

      // Crear o actualizar el código de invitación
      const { data, error } = await supabase
        .from('club_invitation_codes')
        .upsert({ club_id: clubId, code: generatedCode }, { onConflict: 'club_id' })
        .select()
        .single();

      if (error) throw error;
      
      setInvitationCode(data);
      toast({
        title: "¡Éxito!",
        description: `Código de invitación generado: ${generatedCode}`,
      });
      return data;
    } catch (error: any) {
      console.error('Error al generar código:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el código de invitación",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAssistantRequest = async (clubCode: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar que el código existe
      const { data: codeData, error: codeError } = await supabase
        .from('club_invitation_codes')
        .select('club_id')
        .eq('code', clubCode)
        .single();

      if (codeError || !codeData) {
        throw new Error('Código de invitación inválido');
      }

      // Crear solicitud
      const { data, error } = await supabase
        .from('assistant_requests')
        .insert({
          club_id: codeData.club_id,
          user_id: user.id,
          email: user.email!,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud ha sido enviada al entrenador principal",
      });
      return data;
    } catch (error: any) {
      console.error('Error al crear solicitud:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistantRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assistant_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssistantRequests(data || []);
    } catch (error: any) {
      console.error('Error al obtener solicitudes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveAssistantRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('approve_assistant_request', {
        request_id: requestId
      });

      if (error) throw error;
      if (!data) throw new Error('No se pudo aprobar la solicitud');
      
      setAssistantRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "¡Éxito!",
        description: "Solicitud aprobada correctamente",
      });
      return true;
    } catch (error: any) {
      console.error('Error al aprobar solicitud:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar la solicitud",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectAssistantRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('assistant_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      
      setAssistantRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada",
      });
    } catch (error: any) {
      console.error('Error al rechazar solicitud:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo rechazar la solicitud",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitationCode();
    fetchAssistantRequests();
  }, []);

  return {
    invitationCode,
    assistantRequests,
    loading,
    generateInvitationCode,
    createAssistantRequest,
    approveAssistantRequest,
    rejectAssistantRequest,
    refetch: () => {
      fetchInvitationCode();
      fetchAssistantRequests();
    },
  };
};