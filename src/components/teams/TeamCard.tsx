import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2 } from 'lucide-react';
import { Team } from '@/hooks/useTeams';
import { Player } from '@/hooks/usePlayers';

interface TeamCardProps {
  team: Team;
  players: Player[];
  canEdit: boolean;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onOpenDrawer: (team: Team) => void;
}

export const TeamCard = ({ 
  team, 
  players, 
  canEdit, 
  onEdit, 
  onDelete, 
  onOpenDrawer 
}: TeamCardProps) => {
  const playerCount = players.length;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{team.nombre}</CardTitle>
          {canEdit && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(team);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(team.id);
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent 
        className="space-y-4"
        onClick={() => onOpenDrawer(team)}
      >
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-medium">
            {team.categoria}
          </Badge>
          <Badge variant="secondary">
            Año {team.año}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">
            {playerCount} {playerCount === 1 ? 'jugadora' : 'jugadoras'}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          Creado el {new Date(team.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};