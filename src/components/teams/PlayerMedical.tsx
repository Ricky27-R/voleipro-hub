import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Plus, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Player } from '@/hooks/usePlayers';
import { InjuryLog } from '@/hooks/useInjuryLogs';
import { InjuryLogForm } from './InjuryLogForm';

interface PlayerMedicalProps {
  player: Player;
  injuryLogs: InjuryLog[];
  loading: boolean;
  canEdit: boolean;
}

export const PlayerMedical = ({ player, injuryLogs, loading, canEdit }: PlayerMedicalProps) => {
  const [showInjuryForm, setShowInjuryForm] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recovered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'chronic':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'recovered':
        return 'Recuperada';
      case 'chronic':
        return 'Crónica';
      default:
        return 'En recuperación';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'recovered':
        return 'default';
      case 'chronic':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Información Médica
          </CardTitle>
          <CardDescription>
            Alergias y condiciones médicas relevantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Alergias
            </label>
            {player.allergies ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {player.allergies}
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-muted-foreground">No hay alergias registradas</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historial de Lesiones
              </CardTitle>
              <CardDescription>
                Registro de lesiones y su estado de recuperación
              </CardDescription>
            </div>
            {canEdit && (
              <Button onClick={() => setShowInjuryForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Lesión
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Cargando historial...</p>
            </div>
          ) : injuryLogs.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin lesiones registradas</h3>
              <p className="text-muted-foreground">
                Esta jugadora no tiene lesiones en su historial médico
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {injuryLogs.map((injury) => (
                <Card key={injury.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(injury.recovery_status)}
                          <Badge variant={getStatusVariant(injury.recovery_status) as any}>
                            {getStatusLabel(injury.recovery_status)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(injury.injury_date).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1">{injury.description}</h4>
                        {injury.notes && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {injury.notes}
                          </p>
                        )}
                        {injury.expected_recovery_date && injury.recovery_status === 'recovering' && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Recuperación esperada:</strong>{' '}
                            {new Date(injury.expected_recovery_date).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showInjuryForm && (
        <InjuryLogForm
          playerId={player.id}
          isOpen={showInjuryForm}
          onClose={() => setShowInjuryForm(false)}
        />
      )}
    </div>
  );
};