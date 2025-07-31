import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, requireApproval = true, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Admin only routes
  if (adminOnly && profile.role !== 'admin') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Check if user needs approval
  if (requireApproval && profile.role === 'entrenador_principal_pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
};