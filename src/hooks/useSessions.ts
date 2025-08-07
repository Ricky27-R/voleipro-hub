import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Session {
  id: string;
  club_id: string;
  type: 'match' | 'training' | 'scrimmage';
  title: string;
  opponent?: string;
  date: string;
  location: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Set {
  id: string;
  session_id: string;
  set_number: number;
  team_score: number;
  opp_score: number;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  ts: string;
  session_id: string;
  set_id: string;
  team_id: string;
  player_id?: string;
  action_type: 'serve' | 'pass' | 'set' | 'attack' | 'block' | 'dig' | 'free' | 'error';
  result: 'point' | 'error' | 'continue';
  zone?: number;
  created_by: string;
  synced: boolean;
  created_at: string;
}

export const useSessions = (clubId?: string) => {
  return useQuery({
    queryKey: ['sessions', clubId],
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false });
      
      if (clubId) {
        query = query.eq('club_id', clubId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Session[];
    },
    enabled: !!clubId,
  });
};

export const useStartSession = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      type: Session['type'];
      title: string;
      opponent?: string;
      clubId: string;
      teamId: string;
      location: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('start-session', {
        body: params
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: "Session Started",
        description: "Your volleyball session has been started successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to start session:', error);
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useSessionSets = (sessionId?: string) => {
  return useQuery({
    queryKey: ['sets', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sets')
        .select('*')
        .eq('session_id', sessionId!)
        .order('set_number', { ascending: true });
      
      if (error) throw error;
      return data as Set[];
    },
    enabled: !!sessionId,
  });
};

export const useSessionActions = (sessionId?: string) => {
  return useQuery({
    queryKey: ['actions', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actions')
        .select(`
          *,
          players:player_id(full_name, jersey_number),
          teams:team_id(nombre)
        `)
        .eq('session_id', sessionId!)
        .order('ts', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
};

export const useRecordAction = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      setId: string;
      teamId: string;
      playerId?: string;
      actionType: Action['action_type'];
      result: Action['result'];
      zone?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('record-action', {
        body: params
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['actions', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sets', variables.sessionId] });
      // Don't show toast for every action to avoid spam
    },
    onError: (error) => {
      console.error('Failed to record action:', error);
      toast({
        title: "Error",
        description: "Failed to record action. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUndoLastAction = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke('undo-last-action', {
        body: { sessionId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.undoneAction) {
        queryClient.invalidateQueries({ queryKey: ['actions', data.undoneAction.session_id] });
        queryClient.invalidateQueries({ queryKey: ['sets', data.undoneAction.session_id] });
        toast({
          title: "Action Undone",
          description: "Last action has been removed.",
        });
      }
    },
    onError: (error) => {
      console.error('Failed to undo action:', error);
      toast({
        title: "Error",
        description: "Failed to undo action. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useSaveActionsBatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actions: Array<{
      sessionId: string;
      setId: string;
      teamId: string;
      playerId?: string;
      actionType: Action['action_type'];
      result: Action['result'];
      zone?: number;
      timestamp?: string;
    }>) => {
      const { data, error } = await supabase.functions.invoke('save-actions-batch', {
        body: { actions }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['actions', variables[0].sessionId] });
        queryClient.invalidateQueries({ queryKey: ['sets', variables[0].sessionId] });
        toast({
          title: "Actions Synced",
          description: `${data.count} actions have been synced to the server.`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to save actions batch:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync actions. They will be retried later.",
        variant: "destructive",
      });
    },
  });
};