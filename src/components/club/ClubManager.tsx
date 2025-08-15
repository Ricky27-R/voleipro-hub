import { ClubForm } from './ClubForm';
import { useClub, useCreateClub, useUpdateClub } from '@/hooks/useClub';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClubDashboard } from './ClubDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Edit, Plus } from 'lucide-react';

export const ClubManager = () => {
  const { data: club, isLoading } = useClub();
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  // Detectar si debe iniciar en modo edición
  useEffect(() => {
    if (searchParams.get('edit') === 'true' && club) {
      setIsEditing(true);
    }
  }, [searchParams, club]);

  const handleSubmit = async (data: any) => {
    try {
      if (club) {
        await updateClub.mutateAsync({ clubId: club.id, clubData: data });
        setIsEditing(false);
      } else {
        await createClub.mutateAsync(data);
      }
    } catch (error) {
      // Error handling is done in the mutations
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-muted-foreground">Cargando información del club...</div>
        </div>
      </div>
    );
  }

  // Si no tiene club, mostrar formulario de creación
  if (!club) {
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              Registra tu Club
            </CardTitle>
            <CardDescription className="text-lg">
              Como Entrenador Principal, necesitas registrar tu club para comenzar a usar VoleiPro Hub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Completa toda la información solicitada para crear un perfil profesional de tu club.
            </p>
          </CardContent>
        </Card>
        
        <ClubForm onSubmit={handleSubmit} loading={createClub.isPending || updateClub.isPending} />
      </div>
    );
  }

  // Si está editando, mostrar formulario de edición
  if (isEditing) {
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Edit className="h-8 w-8 text-blue-600" />
              Editar Información del Club
            </CardTitle>
            <CardDescription className="text-lg">
              Actualiza la información detallada de tu club.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Modifica los campos que desees actualizar y guarda los cambios.
            </p>
          </CardContent>
        </Card>
        
        <ClubForm club={club} onSubmit={handleSubmit} loading={createClub.isPending || updateClub.isPending} />
        
        <div className="text-center">
          <Button variant="outline" onClick={() => setIsEditing(false)} className="min-w-[150px]">
            Cancelar Edición
          </Button>
        </div>
      </div>
    );
  }

  // Si tiene club, mostrar dashboard del club
  return (
    <ClubDashboard club={club} onEdit={() => setIsEditing(true)} />
  );
};