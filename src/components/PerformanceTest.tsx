import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';
import { Clock, Zap, Database } from 'lucide-react';

interface PerformanceTestProps {
  clubId?: string;
}

export const PerformanceTest = ({ clubId }: PerformanceTestProps) => {
  const [testResults, setTestResults] = useState<any>({});
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useEvents();
  const { teams, loading: teamsLoading, refetch: refetchTeams } = useTeams(clubId);

  const runPerformanceTest = async () => {
    const results: any = {};
    
    // Test Events loading
    const eventsStart = performance.now();
    await refetchEvents();
    const eventsEnd = performance.now();
    results.events = Math.round(eventsEnd - eventsStart);
    
    // Test Teams loading
    const teamsStart = performance.now();
    await refetchTeams();
    const teamsEnd = performance.now();
    results.teams = Math.round(teamsEnd - teamsStart);
    
    setTestResults(results);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Test de Rendimiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Eventos</p>
            <p className="text-2xl font-bold text-blue-600">
              {eventsLoading ? '...' : events?.length || 0}
            </p>
            {testResults.events && (
              <p className="text-xs text-blue-500">{testResults.events}ms</p>
            )}
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Database className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Equipos</p>
            <p className="text-2xl font-bold text-green-600">
              {teamsLoading ? '...' : teams?.length || 0}
            </p>
            {testResults.teams && (
              <p className="text-xs text-green-500">{testResults.teams}ms</p>
            )}
          </div>
        </div>
        
        <Button onClick={runPerformanceTest} className="w-full">
          Ejecutar Test de Rendimiento
        </Button>
        
        {Object.keys(testResults).length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Resultados:</h4>
            <div className="space-y-1 text-sm">
              <p>Eventos: {testResults.events}ms</p>
              <p>Equipos: {testResults.teams}ms</p>
              <p className="font-medium">
                Total: {testResults.events + testResults.teams}ms
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
