import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useApproveCoach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (coachId: string) => {
      const { data, error } = await supabase.rpc('approve_coach', {
        coach_id: coachId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-coaches'] });
    },
  });
};

export const usePendingCoaches = () => {
  return useQuery({
    queryKey: ['pending-coaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'entrenador_principal_pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};