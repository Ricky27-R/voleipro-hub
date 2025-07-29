import { useState } from 'react';
import { Team, useTeams } from '@/hooks/useTeams';
import { TeamsList } from './TeamsList';
import { TeamForm } from './TeamForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft } from 'lucide-react';

interface TeamsManagerProps {
  clubId: string;
  clubName: string;
}

type ViewMode = 'list' | 'create' | 'edit';

export const TeamsManager = ({ clubId, clubName }: TeamsManagerProps) => {
  const { teams, loading, createTeam, updateTeam, deleteTeam } = useTeams(clubId);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const handleCreateTeam = async (teamData: any) => {
    await createTeam(teamData);
    setViewMode('list');
  };

  const handleEditTeam = async (teamData: any) => {
    if (editingTeam) {
      await updateTeam(editingTeam.id, teamData);
      setViewMode('list');
      setEditingTeam(null);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setViewMode('edit');
  };

  const handleDelete = async (teamId: string) => {
    await deleteTeam(teamId);
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingTeam(null);
  };

  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Crear Nuevo Equipo</h2>
            <p className="text-muted-foreground">Agregando equipo a {clubName}</p>
          </div>
        </div>
        <TeamForm
          clubId={clubId}
          onSubmit={handleCreateTeam}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    );
  }

  if (viewMode === 'edit' && editingTeam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Editar Equipo</h2>
            <p className="text-muted-foreground">Modificando: {editingTeam.nombre}</p>
          </div>
        </div>
        <TeamForm
          team={editingTeam}
          clubId={clubId}
          onSubmit={handleEditTeam}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipos</h2>
          <p className="text-muted-foreground">{clubName}</p>
        </div>
        <Button onClick={() => setViewMode('create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Equipo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipos Registrados</CardTitle>
          <CardDescription>
            Gestiona los equipos de tu club. Puedes crear, editar y eliminar equipos según necesites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamsList
            teams={teams}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};