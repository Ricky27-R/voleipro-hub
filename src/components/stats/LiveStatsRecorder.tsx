import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  Users, 
  Trophy,
  Target,
  Zap,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSessionSets, useSessionActions, useRecordAction, useUndoLastAction } from '@/hooks/useSessions';
import { usePlayers } from '@/hooks/usePlayers';
import { MatchDashboard } from './MatchDashboard';
import { ActionRecorder } from './ActionRecorder';

interface LiveStatsRecorderProps {
  clubId: string;
  sessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
}

export const LiveStatsRecorder: React.FC<LiveStatsRecorderProps> = ({
  clubId,
  sessionId,
  onSessionChange
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<Array<any>>([]);
  
  console.log('LiveStatsRecorder render:', { clubId, sessionId, isRecording, isOnline });
  
  const { data: sets, isLoading: setsLoading, error: setsError } = useSessionSets(sessionId || undefined);
  const { data: actions, isLoading: actionsLoading, error: actionsError } = useSessionActions(sessionId || undefined);
  const { players, loading: playersLoading } = usePlayers();
  const recordAction = useRecordAction();
  const undoLastAction = useUndoLastAction();

  const currentSet = sets?.find(set => 
    set.team_score < 25 && set.opp_score < 25
  ) || sets?.[sets.length - 1];

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle offline actions queue
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      // Sync pending actions when back online
      // This would use the save-actions-batch endpoint
      setPendingActions([]);
    }
  }, [isOnline, pendingActions]);

  const handleActionRecord = async (actionData: {
    teamId: string;
    playerId?: string;
    actionType: 'serve' | 'pass' | 'set' | 'attack' | 'block' | 'dig' | 'free' | 'error';
    result: 'point' | 'error' | 'continue';
    zone?: number;
  }) => {
    if (!sessionId || !currentSet) return;

    const action = {
      sessionId,
      setId: currentSet.id,
      ...actionData
    };

    if (isOnline) {
      try {
        await recordAction.mutateAsync(action);
      } catch (error) {
        // Add to pending if failed
        setPendingActions(prev => [...prev, action]);
      }
    } else {
      // Store in pending actions for offline mode
      setPendingActions(prev => [...prev, action]);
    }
  };

  const handleUndo = async () => {
    if (!sessionId) return;
    
    try {
      await undoLastAction.mutateAsync({ sessionId });
    } catch (error) {
      console.error('Failed to undo action:', error);
    }
  };

  // Loading state
  if (setsLoading || actionsLoading || playersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando datos de la sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (setsError || actionsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar la sesión</h3>
            <p className="text-muted-foreground mb-4">
              {setsError?.message || actionsError?.message || 'No se pudieron cargar los datos de la sesión'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No session selected
  if (!sessionId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay sesión seleccionada</h3>
            <p className="text-muted-foreground">
              Selecciona una sesión del resumen para comenzar a registrar estadísticas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Sesión Activa
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                ID de sesión: {sessionId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? 'En línea' : 'Sin conexión'}
              </Badge>
              <Badge variant={isRecording ? 'destructive' : 'secondary'} className="gap-1">
                <Target className="h-3 w-3" />
                {isRecording ? 'Grabando' : 'Pausado'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsRecording(!isRecording)}
              variant={isRecording ? 'destructive' : 'default'}
              className="gap-2"
            >
              {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRecording ? 'Pausar' : 'Iniciar'} Grabación
            </Button>
            
            <Button
              onClick={handleUndo}
              variant="outline"
              size="sm"
              disabled={undoLastAction.isPending}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Deshacer
            </Button>

            {pendingActions.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <WifiOff className="h-3 w-3" />
                {pendingActions.length} acciones pendientes
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard del Partido</TabsTrigger>
          <TabsTrigger value="recorder">Grabador de Acciones</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <MatchDashboard 
            sessionId={sessionId}
            sets={sets || []}
            actions={actions || []}
            currentSet={currentSet}
          />
        </TabsContent>

        <TabsContent value="recorder" className="space-y-4">
          <ActionRecorder
            sessionId={sessionId}
            currentSet={currentSet}
            players={players || []}
            onActionRecord={handleActionRecord}
            isRecording={isRecording}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};