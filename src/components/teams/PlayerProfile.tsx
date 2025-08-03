import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit, User, Activity, Heart, TrendingUp } from 'lucide-react';
import { Player } from '@/hooks/usePlayers';
import { useInjuryLogs } from '@/hooks/useInjuryLogs';
import { PlayerBasicInfo } from './PlayerBasicInfo';
import { PlayerPhysical } from './PlayerPhysical';
import { PlayerMedical } from './PlayerMedical';

interface PlayerProfileProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (player: Player) => void;
  canEdit: boolean;
}

export const PlayerProfile = ({
  player,
  isOpen,
  onClose,
  onEdit,
  canEdit
}: PlayerProfileProps) => {
  const { injuryLogs, loading: injuryLoading } = useInjuryLogs(player?.id);

  if (!player) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPosition = (position: string) => {
    const positions = {
      'Setter': 'Armadora',
      'Libero': 'Líbero',
      'Middle Blocker': 'Central',
      'Outside Hitter': 'Atacante',
      'Opposite': 'Opuesta'
    };
    return positions[position as keyof typeof positions] || position;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {getInitials(player.full_name)}
                  </AvatarFallback>
                </Avatar>
                {player.jersey_number && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-sm rounded-full h-7 w-7 flex items-center justify-center font-bold">
                    {player.jersey_number}
                  </div>
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {player.full_name}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline" className="font-medium">
                    {formatPosition(player.position)}
                  </Badge>
                  <span className="text-muted-foreground">
                    {calculateAge(player.birthdate)} años
                  </span>
                </div>
              </div>
            </div>
            {canEdit && (
              <Button onClick={() => onEdit(player)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="mt-6 overflow-y-auto">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="physical" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Físico
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Médico
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Estadísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <PlayerBasicInfo player={player} />
            </TabsContent>

            <TabsContent value="physical" className="mt-6">
              <PlayerPhysical player={player} />
            </TabsContent>

            <TabsContent value="medical" className="mt-6">
              <PlayerMedical 
                player={player} 
                injuryLogs={injuryLogs}
                loading={injuryLoading}
                canEdit={canEdit}
              />
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Estadísticas</h3>
                <p className="text-muted-foreground">
                  Las estadísticas estarán disponibles en la Fase 2
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};