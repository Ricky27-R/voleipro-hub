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
  Zap
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
  
  const { data: sets } = useSessionSets(sessionId || undefined);
  const { data: actions } = useSessionActions(sessionId || undefined);
  const { players } = usePlayers();
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
      await undoLastAction.mutateAsync(sessionId);
    } catch (error) {
      console.error('Failed to undo action:', error);
    }
  };

  if (!sessionId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Active Session</h3>
          <p className="text-muted-foreground mb-4">
            Start a session to begin recording live stats
          </p>
          <Button onClick={() => onSessionChange(null)}>
            Start New Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <Badge variant="destructive" className="gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Recording
                  </Badge>
                ) : (
                  <Badge variant="secondary">Paused</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm">Synced</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm">Offline</span>
                  </div>
                )}
                {pendingActions.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {pendingActions.length} pending
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!actions || actions.length === 0}
              >
                <RotateCcw className="h-4 w-4" />
                Undo
              </Button>
              
              <Button
                onClick={() => setIsRecording(!isRecording)}
                variant={isRecording ? "destructive" : "default"}
                size="sm"
              >
                {isRecording ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Record
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scoreboard */}
        <div className="lg:col-span-2">
          <MatchDashboard 
            sessionId={sessionId}
            currentSet={currentSet}
            actions={actions || []}
          />
        </div>

        {/* Action Recorder */}
        <div>
          <ActionRecorder
            sessionId={sessionId}
            currentSet={currentSet}
            players={players || []}
            onActionRecord={handleActionRecord}
            isRecording={isRecording}
          />
        </div>
      </div>

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recent Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!actions || actions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No actions recorded yet
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {actions.slice(0, 10).map((action: any) => (
                <div 
                  key={action.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={action.result === 'point' ? 'default' : 
                               action.result === 'error' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {action.action_type}
                    </Badge>
                    <span>
                      {action.players?.full_name || 'Team'} - {action.result}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(action.ts).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};