import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Player } from '@/hooks/usePlayers';

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
}

export const PlayerCard = ({ player, onClick }: PlayerCardProps) => {
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

  const getPositionColor = (position: string) => {
    const colors = {
      'Setter': 'bg-blue-100 text-blue-800 border-blue-200',
      'Libero': 'bg-green-100 text-green-800 border-green-200',
      'Middle Blocker': 'bg-purple-100 text-purple-800 border-purple-200',
      'Outside Hitter': 'bg-orange-100 text-orange-800 border-orange-200',
      'Opposite': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer hover-scale"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(player.full_name)}
              </AvatarFallback>
            </Avatar>
            {player.jersey_number && (
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {player.jersey_number}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {player.full_name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={`text-xs ${getPositionColor(player.position)}`}
              >
                {formatPosition(player.position)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(player.birthdate).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};