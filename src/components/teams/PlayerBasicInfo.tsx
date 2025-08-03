import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, FileText, Hash } from 'lucide-react';
import { Player } from '@/hooks/usePlayers';

interface PlayerBasicInfoProps {
  player: Player;
}

export const PlayerBasicInfo = ({ player }: PlayerBasicInfoProps) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Datos básicos de identificación de la jugadora
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nombre Completo
              </label>
              <p className="text-lg font-semibold">{player.full_name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Documento de Identidad
              </label>
              <p className="text-lg">{player.document_id}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Fecha de Nacimiento
              </label>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg">
                  {new Date(player.birthdate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Edad
              </label>
              <p className="text-lg">{calculateAge(player.birthdate)} años</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Posición
              </label>
              <div className="mt-1">
                <Badge variant="outline" className="text-sm">
                  {formatPosition(player.position)}
                </Badge>
              </div>
            </div>
            
            {player.jersey_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Número de Camiseta
                </label>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-bold">{player.jersey_number}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
          <CardDescription>
            Fechas de registro y actualización
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Fecha de Registro
            </label>
            <p className="text-sm">
              {new Date(player.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Última Actualización
            </label>
            <p className="text-sm">
              {new Date(player.updated_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};