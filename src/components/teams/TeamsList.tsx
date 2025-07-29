import { useState } from 'react';
import { Team } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TeamsListProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  loading?: boolean;
}

const getCategoriaColor = (categoria: string) => {
  const colors = {
    'U12': 'bg-blue-100 text-blue-800',
    'U14': 'bg-green-100 text-green-800',
    'U16': 'bg-yellow-100 text-yellow-800',
    'U18': 'bg-orange-100 text-orange-800',
    'U20': 'bg-red-100 text-red-800',
    'Senior': 'bg-purple-100 text-purple-800',
  };
  return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const TeamsList = ({ teams, onEdit, onDelete, loading }: TeamsListProps) => {
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const handleDelete = async (teamId: string) => {
    setDeletingTeamId(teamId);
    try {
      await onDelete(teamId);
    } finally {
      setDeletingTeamId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Cargando equipos...</div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-6">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay equipos registrados</h3>
          <p className="text-muted-foreground">
            Crea tu primer equipo para comenzar a gestionar tu club.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedTeams = teams.reduce((acc, team) => {
    if (!acc[team.categoria]) {
      acc[team.categoria] = [];
    }
    acc[team.categoria].push(team);
    return acc;
  }, {} as Record<string, Team[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTeams).map(([categoria, categoryTeams]) => (
        <div key={categoria} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={getCategoriaColor(categoria)}>
              {categoria === 'Senior' ? 'Senior' : `Sub-${categoria.slice(1)}`}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {categoryTeams.length} equipo{categoryTeams.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{team.nombre}</span>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(team)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente
                              el equipo "{team.nombre}" de tu club.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(team.id)}
                              disabled={deletingTeamId === team.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingTeamId === team.id ? 'Eliminando...' : 'Eliminar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{team.año}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Creado: {new Date(team.created_at).toLocaleDateString('es-ES')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};