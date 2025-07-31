import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Mail } from 'lucide-react';

const PendingApproval = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Esperando Aprobación</CardTitle>
          <CardDescription>
            Tu registro como entrenador principal está pendiente de aprobación por el administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Mail className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Te notificaremos por email cuando tu cuenta sea aprobada
            </p>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>¿Necesitas ayuda? Contacta al administrador del sistema.</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={signOut}
            className="w-full"
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;