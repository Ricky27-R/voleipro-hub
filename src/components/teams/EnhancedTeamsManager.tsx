import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, Team } from '@/hooks/useTeams';
import { usePlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer, Player } from '@/hooks/usePlayers';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { TeamCard } from './TeamCard';
import { TeamDrawer } from './TeamDrawer';
import { PlayerProfile } from './PlayerProfile';
import { PlayerForm } from '../players/PlayerForm';
import { TeamForm } from './TeamForm';

interface EnhancedTeamsManagerProps {
  clubId: string;
  clubName: string;
}

export const EnhancedTeamsManager = ({ clubId, clubName }: EnhancedTeamsManagerProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: teams = [], isLoading: teamsLoading } = useTeams(clubId);
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const { data: players = [] } = usePlayers();
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayerMutation = useDeletePlayer();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const canEdit = profile?.role === 'entrenador_principal' || profile?.role === 'entrenador_asistente';

  const filteredTeams = teams.filter(team =>
    team.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeamPlayers = (teamId: string) => {
    return players.filter(player => player.team_id === teamId);
  };

  const handleTeamDrawerOpen = (team: Team) => {
    setSelectedTeam(team);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleNewPlayer = () => {
    setEditingPlayer(null);
    setShowPlayerForm(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      const confirmed = window.confirm('¿Eliminar jugadora? Esta acción no se puede deshacer.');
      if (!confirmed) return;
      await deletePlayerMutation.mutateAsync(playerId);
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Error eliminando jugadora:', error);
    }
  };
  const handlePlayerSubmit = async (data: any) => {
    try {
      if (editingPlayer) {
        await updatePlayer.mutateAsync({ playerId: editingPlayer.id, playerData: data });
      } else {
        await createPlayer.mutateAsync({ ...data, team_id: selectedTeam?.id });
      }
      setShowPlayerForm(false);
      setEditingPlayer(null);
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  if (teamsLoading) {
    return <div className="text-center py-8">Cargando equipos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Equipos de {clubName}</h2>
        {canEdit && view === 'list' && (
          <Button onClick={() => setView('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Equipo
          </Button>
        )}
      </div>

      {view === 'list' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar equipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                players={getTeamPlayers(team.id)}
                canEdit={canEdit}
                onEdit={(team) => {
                  setEditingTeam(team);
                  setView('edit');
                }}
                onDelete={(teamId) => deleteTeam.mutateAsync({ teamId, clubId })}
                onOpenDrawer={handleTeamDrawerOpen}
              />
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron equipos</p>
              {canEdit && (
                <Button onClick={() => setView('create')} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Equipo
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {view === 'create' && (
        <TeamForm
          clubId={clubId}
          onSubmit={async (data) => {
            await createTeam.mutateAsync(data as Omit<Team, 'id' | 'created_at' | 'updated_at'>);
            setView('list');
          }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && editingTeam && (
        <TeamForm
          clubId={clubId}
          team={editingTeam}
          onSubmit={async (data) => {
            await updateTeam.mutateAsync({ teamId: editingTeam.id, teamData: data });
            setView('list');
            setEditingTeam(null);
          }}
          onCancel={() => {
            setView('list');
            setEditingTeam(null);
          }}
        />
      )}

      <TeamDrawer
        team={selectedTeam}
        players={selectedTeam ? getTeamPlayers(selectedTeam.id) : []}
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        onNewPlayer={handleNewPlayer}
        onPlayerClick={handlePlayerClick}
        canEdit={canEdit}
      />

      <PlayerProfile
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onEdit={handleEditPlayer}
        onDelete={(id) => handleDeletePlayer(id)}
        canEdit={canEdit}
      />

      {showPlayerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <PlayerForm
              onSubmit={handlePlayerSubmit}
              onCancel={() => {
                setShowPlayerForm(false);
                setEditingPlayer(null);
              }}
              initialData={editingPlayer || undefined}
              teams={teams}
              isEditing={!!editingPlayer}
            />
          </div>
        </div>
      )}
    </div>
  );
};