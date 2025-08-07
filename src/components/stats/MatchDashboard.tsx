import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Users } from 'lucide-react';

interface MatchDashboardProps {
  sessionId: string;
  currentSet: any;
  actions: any[];
}

export const MatchDashboard: React.FC<MatchDashboardProps> = ({
  sessionId,
  currentSet,
  actions
}) => {
  const teamScore = currentSet?.team_score || 0;
  const oppScore = currentSet?.opp_score || 0;
  const setNumber = currentSet?.set_number || 1;

  // Calculate live stats
  const recentActions = actions.slice(0, 20);
  const teamActions = recentActions.filter(a => a.team_id);
  const serves = teamActions.filter(a => a.action_type === 'serve');
  const attacks = teamActions.filter(a => a.action_type === 'attack');
  const blocks = teamActions.filter(a => a.action_type === 'block');

  const serveEfficiency = serves.length > 0 
    ? (serves.filter(s => s.result === 'point').length / serves.length) * 100 
    : 0;

  const attackEfficiency = attacks.length > 0
    ? (attacks.filter(a => a.result === 'point').length / attacks.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5" />
            Set {setNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {teamScore}
              </div>
              <Badge variant="default">Our Team</Badge>
            </div>
            
            <div className="text-2xl font-bold text-muted-foreground">
              :
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-destructive mb-2">
                {oppScore}
              </div>
              <Badge variant="outline">Opponent</Badge>
            </div>
          </div>

          {/* Set Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Set Progress</span>
              <span>First to 25</span>
            </div>
            <div className="relative">
              <Progress value={(Math.max(teamScore, oppScore) / 25) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Serve Efficiency</span>
            </div>
            <div className="text-2xl font-bold">{serveEfficiency.toFixed(1)}%</div>
            <Progress value={serveEfficiency} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Attack %</span>
            </div>
            <div className="text-2xl font-bold">{attackEfficiency.toFixed(1)}%</div>
            <Progress value={attackEfficiency} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Total Actions</span>
            </div>
            <div className="text-2xl font-bold">{teamActions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Blocks</span>
            </div>
            <div className="text-2xl font-bold">{blocks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rotation Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Court Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 aspect-[3/2] bg-muted/20 p-4 rounded">
            {[1, 2, 3, 4, 5, 6].map((position) => (
              <div 
                key={position}
                className="bg-background border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center text-sm font-medium"
              >
                {position}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Positions 1-6 (clockwise from serving position)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};