import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { useStartSession } from '@/hooks/useSessions';
import { useTeams } from '@/hooks/useTeams';
import { CalendarDays, MapPin, Users, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuickStartSessionProps {
  clubId: string;
  onClose: () => void;
  onSessionStarted: (sessionId: string) => void;
}

interface SessionForm {
  type: 'match' | 'training' | 'scrimmage';
  title: string;
  opponent?: string;
  teamId: string;
  location: string;
}

export const QuickStartSession: React.FC<QuickStartSessionProps> = ({
  clubId,
  onClose,
  onSessionStarted
}) => {
  const [step, setStep] = useState<'preset' | 'custom'>('preset');
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SessionForm>();
  const startSession = useStartSession();
  const { teams, loading: teamsLoading } = useTeams(clubId);

  const sessionType = watch('type');



  const presetSessions = [
    {
      type: 'training' as const,
      title: 'Sesión de Entrenamiento',
      icon: Users,
      description: 'Entrenamiento regular del equipo'
    },
    {
      type: 'match' as const,
      title: 'Partido',
      icon: Zap,
      description: 'Partido competitivo'
    },
    {
      type: 'scrimmage' as const,
      title: 'Amistoso',
      icon: CalendarDays,
      description: 'Partido de práctica'
    }
  ];

  const handlePresetSelect = (preset: typeof presetSessions[0]) => {
    setValue('type', preset.type);
    setValue('title', preset.title);
    setStep('custom');
  };

  const onSubmit = async (data: SessionForm) => {
    try {
      const result = await startSession.mutateAsync({
        type: data.type,
        title: data.title,
        opponent: data.opponent,
        clubId,
        teamId: data.teamId,
        location: data.location
      });
      
      if (result.session) {
        toast.success('Sesión iniciada correctamente');
        onSessionStarted(result.session.id);
      } else {
        throw new Error('No se pudo crear la sesión');
      }
    } catch (error) {
      toast.error('Error al iniciar la sesión: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  // Loading state for teams
  if (teamsLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar Sesión</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando equipos...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No teams available
  if (!teams || teams.length === 0) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No hay equipos disponibles</DialogTitle>
          </DialogHeader>
          <div className="text-center p-6">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Necesitas crear al menos un equipo antes de poder iniciar una sesión.
            </p>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Sesión</DialogTitle>
        </DialogHeader>

        {step === 'preset' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Elige un tipo de sesión para comenzar rápidamente
            </p>
            <div className="grid gap-3">
              {presetSessions.map((preset) => {
                const Icon = preset.icon;
                return (
                  <Card 
                    key={preset.type}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <h4 className="font-medium">{preset.title}</h4>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 'custom' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Sesión *</Label>
              <Select value={sessionType} onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Entrenamiento</SelectItem>
                  <SelectItem value="match">Partido</SelectItem>
                  <SelectItem value="scrimmage">Amistoso</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ej: Entrenamiento de ataque"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamId">Equipo *</Label>
              <Select onValueChange={(value) => setValue('teamId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.nombre} - {team.categoria} {team.año}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamId && (
                <p className="text-sm text-destructive">{errors.teamId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ej: Gimnasio Municipal"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            {sessionType === 'match' && (
              <div className="space-y-2">
                <Label htmlFor="opponent">Oponente</Label>
                <Input
                  id="opponent"
                  {...register('opponent')}
                  placeholder="Ej: Club Deportivo Rival"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('preset')}
                className="flex-1"
              >
                Atrás
              </Button>
              <Button 
                type="submit" 
                disabled={startSession.isPending}
                className="flex-1"
              >
                {startSession.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Iniciando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};