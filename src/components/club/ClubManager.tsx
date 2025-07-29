import { ClubForm } from './ClubForm';
import { useClub } from '@/hooks/useClub';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ClubDashboard } from './ClubDashboard';

export const ClubManager = () => {
  const { club, loading, createClub, updateClub } = useClub();
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (data: any) => {
    if (club) {
      await updateClub(data);
      setIsEditing(false);
    } else {
      await createClub(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // Si no tiene club, mostrar formulario de creación
  if (!club) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Registra tu Club</h1>
          <p className="text-muted-foreground mt-2">
            Como Entrenador Principal, necesitas registrar tu club para comenzar.
          </p>
        </div>
        <ClubForm onSubmit={handleSubmit} loading={loading} />
      </div>
    );
  }

  // Si está editando, mostrar formulario de edición
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Editar Club</h1>
          <p className="text-muted-foreground mt-2">
            Actualiza la información de tu club.
          </p>
        </div>
        <ClubForm club={club} onSubmit={handleSubmit} loading={loading} />
        <div className="text-center">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancelar
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