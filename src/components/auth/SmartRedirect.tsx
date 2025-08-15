import { Navigate } from 'react-router-dom';
import { useClub } from '@/hooks/useClub';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente de redirección inteligente que envía al usuario al lugar correcto
 * basado en si ya tiene un club registrado o no.
 */
export const SmartRedirect = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: club, isLoading: clubLoading } = useClub();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { toast } = useToast();
  const [processingCode, setProcessingCode] = useState(false);

  // Procesar código pendiente si el usuario está autenticado
  useEffect(() => {
    const processPendingCode = async () => {
      const pendingCode = localStorage.getItem('pending_club_code');
      
      // Limpiar código si el usuario es entrenador principal (no necesita código)
      if (pendingCode && user && profile && profile.role === 'entrenador_principal') {
        localStorage.removeItem('pending_club_code');
        return;
      }
      
      if (pendingCode && user && !processingCode && profile?.role === 'entrenador_principal_pending') {
        setProcessingCode(true);
        
        try {
          console.log('Procesando código pendiente:', pendingCode);
          const { data: result, error } = await supabase.rpc('register_with_club_code', {
            p_code: pendingCode
          });
          
          if (error) {
            throw error;
          }
          
          // Limpiar el código guardado
          localStorage.removeItem('pending_club_code');
          
          toast({
            title: "¡Código aplicado exitosamente!",
            description: "Te has unido al club como entrenador asistente. Tu solicitud está pendiente de aprobación.",
          });
          
          // Refrescar la página para actualizar el perfil
          window.location.reload();
          
        } catch (error) {
          console.error('Error processing pending code:', error);
          toast({
            title: "Error al aplicar código",
            description: `No se pudo aplicar el código del club: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            variant: "destructive",
          });
          
          // Limpiar el código inválido
          localStorage.removeItem('pending_club_code');
        } finally {
          setProcessingCode(false);
        }
      }
    };
    
    if (user && profile && !authLoading && !profileLoading) {
      processPendingCode();
    }
  }, [user, profile, authLoading, profileLoading, processingCode, toast]);

  // Mientras carga, mostrar loading
  if (authLoading || clubLoading || profileLoading || processingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {processingCode ? 'Aplicando código del club...' : 'Verificando información...'}
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, ir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If no profile yet, redirect to default for now
  if (!profile) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Handle different roles based on their status
  switch (profile.role) {
    case 'entrenador_principal_pending':
      return <Navigate to="/pending-approval" replace />;
      
    case 'entrenador_asistente_pending':
      return <Navigate to="/assistant-pending" replace />;
      
    case 'entrenador_principal':
      // Approved main coach - check if has club
      if (!club) {
        return <Navigate to="/club" replace />;
      }
      return <Navigate to="/dashboard" replace />;
      
    case 'entrenador_asistente':
      // Approved assistant coach - should have club
      if (!profile.club_id) {
        return <Navigate to="/assistant-pending" replace />;
      }
      return <Navigate to="/dashboard" replace />;
      
    case 'admin':
      return <Navigate to="/admin" replace />;
      
    default:
      // Unknown role - redirect to pending approval
      return <Navigate to="/pending-approval" replace />;
  }
};
