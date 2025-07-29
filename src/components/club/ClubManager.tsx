import { ClubForm } from './ClubForm';
import { TeamsManager } from '../teams/TeamsManager';
import { useClub } from '@/hooks/useClub';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Building2, Edit } from 'lucide-react';
import { useState } from 'react';

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

  // Si tiene club, mostrar información del club
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Club</h1>
          <p className="text-muted-foreground mt-2">
            Información de tu club registrado.
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="gap-2">
          <Edit className="h-4 w-4" />
          Editar Club
        </Button>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {club.logo_url ? (
              <img 
                src={club.logo_url} 
                alt={`Logo de ${club.nombre}`}
                className="h-16 w-16 object-cover rounded-full border-2 border-border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{club.nombre}</CardTitle>
              <Badge variant="secondary" className="mt-2">
                Club Registrado
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Ciudad</p>
                <p className="text-sm text-muted-foreground">{club.ciudad}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Fecha de Creación</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(club.fecha_creacion).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Club registrado el {new Date(club.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};