import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SmartRedirect } from '@/components/auth/SmartRedirect';

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect intelligently if already logged in
  if (user && !loading) {
    return <SmartRedirect />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">VoleiProManager</h1>
        <p className="text-xl text-muted-foreground">Gestión integral de clubes de voleibol</p>
        <div className="space-y-4">
          <Link to="/login">
            <Button className="w-full">
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="w-full">
              Crear Cuenta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
