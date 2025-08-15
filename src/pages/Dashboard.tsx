import { Navigate } from 'react-router-dom';
import { useClub } from '@/hooks/useClub';
import { ClubDashboard } from '@/components/club/ClubDashboard';

const Dashboard = () => {
  const { data: club, isLoading } = useClub();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no tiene club, redirigir al formulario de creación
  if (!club) {
    return <Navigate to="/club" replace />;
  }

  // Mostrar el dashboard completo
  return <ClubDashboard club={club} onEdit={() => {
    // Redirigir al formulario de edición del club
    window.location.href = '/club?edit=true';
  }} />;
};

export default Dashboard;
