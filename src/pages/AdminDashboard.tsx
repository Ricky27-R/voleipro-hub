import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePendingCoaches, useApproveCoach } from '@/hooks/useProfile';
import { CheckCircle, Clock, User } from 'lucide-react';

const AdminDashboard = () => {
  const { data: pendingCoaches, isLoading } = usePendingCoaches();
  const approveCoach = useApproveCoach();
  const { toast } = useToast();

  const handleApprove = async (coachId: string, firstName: string, lastName: string) => {
    try {
      await approveCoach.mutateAsync(coachId);
      toast({
        title: "Entrenador aprobado",
        description: `${firstName} ${lastName} ha sido aprobado como entrenador principal.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar al entrenador. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las aprobaciones de entrenadores principales
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Entrenadores Pendientes de Aprobación
            </CardTitle>
            <CardDescription>
              Revisa y aprueba las solicitudes de entrenadores principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!pendingCoaches || pendingCoaches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No hay entrenadores pendientes de aprobación</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {coach.first_name} {coach.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {coach.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {new Date(coach.created_at).toLocaleDateString()}
                          </Badge>
                          <Badge variant="outline">Pendiente</Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleApprove(coach.id, coach.first_name || '', coach.last_name || '')}
                      disabled={approveCoach.isPending}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {approveCoach.isPending ? "Aprobando..." : "Aprobar"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;