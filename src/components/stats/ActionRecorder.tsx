import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Volleyball, 
  Target, 
  Shield, 
  Zap, 
  RotateCcw, 
  User,
  Users
} from 'lucide-react';

interface ActionRecorderProps {
  sessionId: string;
  currentSet: any;
  players: any[];
  onActionRecord: (action: {
    teamId: string;
    playerId?: string;
    actionType: string;
    result: string;
    zone?: number;
  }) => void;
  isRecording: boolean;
}

export const ActionRecorder: React.FC<ActionRecorderProps> = ({
  sessionId,
  currentSet,
  players,
  onActionRecord,
  isRecording
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [actionMode, setActionMode] = useState<'serve' | 'attack' | 'block' | 'dig' | 'set' | 'pass'>('serve');

  const actionTypes = [
    { type: 'serve', label: 'Serve', icon: Volleyball, color: 'bg-blue-500' },
    { type: 'attack', label: 'Attack', icon: Zap, color: 'bg-red-500' },
    { type: 'block', label: 'Block', icon: Shield, color: 'bg-green-500' },
    { type: 'dig', label: 'Dig', icon: Target, color: 'bg-purple-500' },
    { type: 'set', label: 'Set', icon: RotateCcw, color: 'bg-orange-500' },
    { type: 'pass', label: 'Pass', icon: User, color: 'bg-cyan-500' },
  ];

  const results = [
    { value: 'point', label: 'Point', variant: 'default' as const },
    { value: 'error', label: 'Error', variant: 'destructive' as const },
    { value: 'continue', label: 'Continue', variant: 'secondary' as const },
  ];

  const zones = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleActionRecord = (result: string) => {
    if (!isRecording) return;

    // Get team ID - this would need to come from props or context
    const teamId = 'team-id'; // TODO: Get from session/team selection

    onActionRecord({
      teamId,
      playerId: selectedPlayer || undefined,
      actionType: actionMode,
      result,
      zone: selectedZone || undefined,
    });

    // Reset selections after recording
    setSelectedZone(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volleyball className="h-5 w-5" />
          Action Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Action Type</label>
          <div className="grid grid-cols-2 gap-2">
            {actionTypes.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.type}
                  variant={actionMode === action.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActionMode(action.type as any)}
                  className="h-auto p-3"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{action.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Player Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Player (Optional)</label>
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Team Action</SelectItem>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  #{player.jersey_number} {player.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zone Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Court Zone</label>
          <div className="grid grid-cols-3 gap-1 aspect-square">
            {zones.map((zone) => (
              <Button
                key={zone}
                variant={selectedZone === zone ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedZone(zone)}
                className="aspect-square p-1 text-xs"
              >
                {zone}
              </Button>
            ))}
          </div>
        </div>

        {/* Result Buttons */}
        <div>
          <label className="text-sm font-medium mb-2 block">Result</label>
          <div className="space-y-2">
            {results.map((result) => (
              <Button
                key={result.value}
                variant={result.variant}
                onClick={() => handleActionRecord(result.value)}
                disabled={!isRecording}
                className="w-full"
                size="lg"
              >
                {result.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Users className="h-3 w-3" />
            <span className="font-medium">Quick Tips:</span>
          </div>
          <ul className="space-y-1">
            <li>• Tap action type → select player → choose result</li>
            <li>• Zone selection is optional</li>
            <li>• Actions are saved automatically</li>
            <li>• Use undo to correct mistakes</li>
          </ul>
        </div>

        {!isRecording && (
          <div className="text-center p-4 bg-muted/20 rounded">
            <p className="text-sm text-muted-foreground">
              Recording is paused. Press Record to continue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};