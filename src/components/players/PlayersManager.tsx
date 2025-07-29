import React, { useState } from 'react';
import { usePlayers, Player } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import { PlayerForm } from './PlayerForm';
import { PlayersList } from './PlayersList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft, Users } from 'lucide-react';

interface PlayersManagerProps {
  clubId: string;
  clubName: string;
}

export function PlayersManager({ clubId, clubName }: PlayersManagerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [groupByPosition, setGroupByPosition] = useState(false);

  const { teams, loading: teamsLoading } = useTeams(clubId);
  const { players, loading: playersLoading, createPlayer, updatePlayer, deletePlayer } = usePlayers(
    selectedTeamFilter === 'all' ? undefined : selectedTeamFilter
  );

  const handleCreatePlayer = async (playerData: any) => {
    try {
      await createPlayer(playerData);
      setViewMode('list');
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  const handleEditPlayer = async (playerData: any) => {
    if (!editingPlayer) return;
    
    try {
      await updatePlayer(editingPlayer.id, playerData);
      setViewMode('list');
      setEditingPlayer(null);
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setViewMode('edit');
  };

  const handleDelete = async (playerId: string) => {
    try {
      await deletePlayer(playerId);
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingPlayer(null);
  };

  if (teamsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay equipos registrados</h3>
          <p className="text-muted-foreground">
            Necesitas crear al menos un equipo antes de poder registrar jugadoras.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h2 className="text-2xl font-bold">Nueva Jugadora</h2>
        </div>
        
        <PlayerForm
          onSubmit={handleCreatePlayer}
          onCancel={handleCancel}
          teams={teams}
        />
      </div>
    );
  }

  if (viewMode === 'edit' && editingPlayer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h2 className="text-2xl font-bold">Editar Jugadora</h2>
        </div>
        
        <PlayerForm
          onSubmit={handleEditPlayer}
          onCancel={handleCancel}
          initialData={editingPlayer}
          teams={teams}
          isEditing
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Jugadoras - {clubName}</h2>
        <Button onClick={() => setViewMode('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Jugadora
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y Opciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-2">
              <Label htmlFor="team-filter">Filtrar por equipo:</Label>
              <Select value={selectedTeamFilter} onValueChange={setSelectedTeamFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los equipos</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.nombre} - {team.categoria} ({team.año})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="group-by-position"
                checked={groupByPosition}
                onCheckedChange={setGroupByPosition}
              />
              <Label htmlFor="group-by-position">Agrupar por posición</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <PlayersList
        players={players}
        teams={teams}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={playersLoading}
        groupByPosition={groupByPosition}
      />
    </div>
  );
}