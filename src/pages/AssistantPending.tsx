import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface AssistantRequest {
  id: string;
  club_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AssistantPending = () => {
  const [request, setRequest] = useState<AssistantRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRequest = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('assistant_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setRequest(data || null);
      } catch (error) {
        console.error('Error al obtener solicitud:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Estado de Solicitud</CardTitle>
          <CardDescription>
            Tu solicitud para unirte como entrenador asistente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {request ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {getStatusIcon(request.status)}
              </div>
              
              <div className="space-y-2">
                <Badge variant={getStatusVariant(request.status)} className="text-sm">
                  {getStatusText(request.status)}
                </Badge>
                
                <p className="text-sm text-muted-foreground">
                  Solicitud enviada el {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>

              {request.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Tu solicitud está siendo revisada por el entrenador principal. 
                    Te notificaremos cuando sea aprobada.
                  </p>
                </div>
              )}

              {request.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ¡Felicitaciones! Tu solicitud ha sido aprobada. 
                    Ya puedes acceder al dashboard del club.
                  </p>
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    Tu solicitud ha sido rechazada. 
                    Contacta al entrenador principal para más información.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No se encontró ninguna solicitud pendiente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantPending;