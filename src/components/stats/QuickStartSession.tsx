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
import { CalendarDays, MapPin, Users, Zap } from 'lucide-react';

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
  const { teams } = useTeams(clubId);

  const sessionType = watch('type');

  const presetSessions = [
    {
      type: 'training' as const,
      title: 'Practice Session',
      icon: Users,
      description: 'Regular team practice'
    },
    {
      type: 'match' as const,
      title: 'Match',
      icon: Zap,
      description: 'Competitive match'
    },
    {
      type: 'scrimmage' as const,
      title: 'Scrimmage',
      icon: CalendarDays,
      description: 'Practice match'
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
        onSessionStarted(result.session.id);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Start Session</DialogTitle>
        </DialogHeader>

        {step === 'preset' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a session type to get started quickly
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
                        <Icon className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-medium">{preset.title}</h3>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setStep('custom')}
              className="w-full"
            >
              Custom Session
            </Button>
          </div>
        )}

        {step === 'custom' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Session Type</Label>
              <Select 
                onValueChange={(value) => setValue('type', value as SessionForm['type'])}
                defaultValue=""
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="scrimmage">Scrimmage</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">Session type is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g., Morning Practice"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {sessionType === 'match' && (
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  {...register('opponent')}
                  placeholder="Opponent team name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="teamId">Team</Label>
              <Select 
                onValueChange={(value) => setValue('teamId', value)}
                defaultValue=""
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.nombre} ({team.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamId && (
                <p className="text-sm text-destructive">Team selection is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location', { required: 'Location is required' })}
                placeholder="e.g., Main Gym"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('preset')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit"
                disabled={startSession.isPending}
                className="flex-1"
              >
                {startSession.isPending ? 'Starting...' : 'Start Session'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};