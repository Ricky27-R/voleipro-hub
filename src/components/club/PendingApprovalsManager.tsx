import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Clock, Users, Shield, Mail, Calendar } from 'lucide-react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PendingApprovalsManagerProps {
  clubId: string;
}

interface PendingUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  club_id: string;
  team_id?: string;
  created_at: string;
  team_name?: string;
}

export const PendingApprovalsManager: React.FC<PendingApprovalsManagerProps> = ({ clubId }) => {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, [clubId]);

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          club_id,
          team_id,
          created_at,
          teams (nombre)
        `)
        .eq('club_id', clubId)
        .eq('role', 'entrenador_asistente_pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const usersWithTeamNames = data?.map(user => ({
        ...user,
        team_name: user.teams?.nombre || 'Sin equipo asignado'
      })) || [];

      setPendingUsers(usersWithTeamNames);
    } catch (error) {
      console.error('Error loading pending users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes pendientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { data: success, error } = await supabase.rpc('approve_assistant_coach', {
        p_user_id: userId
      });

      if (error) throw error;
      if (!success) throw new Error('No se pudo aprobar al entrenador asistente');

      toast({
        title: "¡Aprobado!",
        description: 'Entrenador asistente aprobado exitosamente',
      });

      // Reload pending users
      loadPendingUsers();
    } catch (error: any) {
      toast({
        title: "Error al aprobar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      // For rejection, we could either delete the user or change their role to 'rejected'
      // For now, we'll remove them from the club
      const { error } = await supabase
        .from('profiles')
        .update({
          club_id: null,
          team_id: null,
          role: 'entrenador_principal_pending' // Reset to default
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada exitosamente",
      });

      // Reload pending users
      loadPendingUsers();
    } catch (error: any) {
      toast({
        title: "Error al rechazar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // All pending users are assistant coaches now

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando solicitudes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canApprove = profile?.role === 'entrenador_principal';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Solicitudes de Entrenadores Asistentes
        </CardTitle>
        <CardDescription>
          Gestiona las solicitudes pendientes de entrenadores asistentes ({pendingUsers.length} solicitudes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!canApprove && (
          <div className="text-center py-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <p className="text-amber-700">Solo el entrenador principal puede aprobar entrenadores asistentes</p>
          </div>
        )}

        <div className="space-y-3">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay solicitudes de entrenadores pendientes</p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <Card key={user.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{user.first_name} {user.last_name}</h4>
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Entrenador Asistente
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Solicitado: {formatDate(user.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {canApprove && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => approveUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-green-600 hover:text-green-700 hover:border-green-300"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === user.id}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Rechazar solicitud?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción rechazará la solicitud de {user.first_name} {user.last_name} para unirse como entrenador asistente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => rejectUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Rechazar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
