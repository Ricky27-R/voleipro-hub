import React from 'react';
import { Player } from '@/hooks/usePlayers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, UserCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PlayersListProps {
  players: Player[];
  teams: Array<{ id: string; nombre: string; categoria: string; año: number }>;
  onEdit: (player: Player) => void;
  onDelete: (playerId: string) => void;
  loading: boolean;
  groupByPosition?: boolean;
}

export function PlayersList({ players, teams, onEdit, onDelete, loading, groupByPosition = false }: PlayersListProps) {
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? `${team.nombre} - ${team.categoria} (${team.año})` : 'Equipo no encontrado';
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <UserCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay jugadoras registradas</p>
        </CardContent>
      </Card>
    );
  }

  const renderPlayerCard = (player: Player) => (
    <Card key={player.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{player.full_name}</h3>
              <Badge variant="secondary">{player.position}</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Documento: {player.document_id}</p>
              <p>Edad: {calculateAge(player.birthdate)} años</p>
              <p>Equipo: {getTeamName(player.team_id)}</p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(player)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar jugadora?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente a {player.full_name} del sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(player.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (groupByPosition) {
    const groupedPlayers = players.reduce((acc, player) => {
      if (!acc[player.position]) {
        acc[player.position] = [];
      }
      acc[player.position].push(player);
      return acc;
    }, {} as Record<string, Player[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedPlayers).map(([position, positionPlayers]) => (
          <div key={position}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {position}
              <Badge variant="outline">{positionPlayers.length}</Badge>
            </h3>
            <div className="space-y-3">
              {positionPlayers.map(renderPlayerCard)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {players.map(renderPlayerCard)}
    </div>
  );
}