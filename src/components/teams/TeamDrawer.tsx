import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Team } from '@/hooks/useTeams';
import { Player } from '@/hooks/usePlayers';
import { PlayerCard } from './PlayerCard';

interface TeamDrawerProps {
  team: Team | null;
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
  onNewPlayer: () => void;
  onPlayerClick: (player: Player) => void;
  canEdit: boolean;
}

export const TeamDrawer = ({
  team,
  players,
  isOpen,
  onClose,
  onNewPlayer,
  onPlayerClick,
  canEdit
}: TeamDrawerProps) => {
  if (!team) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl animate-slide-in-right">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold">
                {team.nombre}
              </SheetTitle>
              <SheetDescription className="text-base">
                {team.categoria} - Año {team.año}
              </SheetDescription>
            </div>
            {canEdit && (
              <Button onClick={onNewPlayer} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Jugadora
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Jugadoras ({players.length})
            </h3>
            <p className="text-muted-foreground text-sm">
              Haz clic en una jugadora para ver su perfil completo
            </p>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <p className="text-lg font-medium">No hay jugadoras registradas</p>
                <p className="text-sm">Agrega tu primera jugadora para comenzar</p>
              </div>
              {canEdit && (
                <Button onClick={onNewPlayer} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Jugadora
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onClick={() => onPlayerClick(player)}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};