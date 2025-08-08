import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, Plus, Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { useSessions } from '@/hooks/useSessions';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { QuickStartSession } from './QuickStartSession';
import { LiveStatsRecorder } from './LiveStatsRecorder';
import { StatsCenter } from './StatsCenter';

interface StatsManagerProps {
  clubId: string;
}

export const StatsManager: React.FC<StatsManagerProps> = ({ clubId }) => {
  const { data: profile } = useProfile();
  const { data: sessions, isLoading } = useSessions(clubId);
  const [activeView, setActiveView] = useState<'overview' | 'live' | 'stats'>('overview');
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-6">Cargando estadísticas...</div>;
  }

  const recentSessions = sessions?.slice(0, 5) || [];
  const activeSessions = sessions?.filter(s => 
    new Date(s.date).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estadísticas y Análisis</h1>
          <p className="text-muted-foreground">Consulta el rendimiento y analiza el progreso del equipo</p>
        </div>
        <Button 
          onClick={() => setShowQuickStart(true)}
          className="gap-2"
        >
          <PlayCircle className="h-4 w-4" />
          Iniciar Sesión
        </Button>
      </div>

      {/* Main Navigation */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="live">Registro en vivo</TabsTrigger>
          <TabsTrigger value="stats">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sesiones totales</p>
                    <p className="text-2xl font-bold">{sessions?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sesiones activas</p>
                        <p className="text-2xl font-bold">{activeSessions.length}</p>
                      </div>
                    </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Esta semana</p>
                        <p className="text-2xl font-bold">
                          {sessions?.filter(s => 
                            new Date(s.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                          ).length || 0}
                        </p>
                      </div>
                    </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Este mes</p>
                        <p className="text-2xl font-bold">
                          {sessions?.filter(s => 
                            new Date(s.date).getMonth() === new Date().getMonth()
                          ).length || 0}
                        </p>
                      </div>
                    </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Sesiones recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aún no hay sesiones</p>
                  <Button 
                    onClick={() => setShowQuickStart(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    Inicia tu primera sesión
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          session.type === 'match' ? 'default' :
                          session.type === 'training' ? 'secondary' : 'outline'
                        }>
                          {session.type}
                        </Badge>
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(session.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </div>
                            {session.opponent && (
                              <span>vs {session.opponent}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setActiveView('live');
                        }}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live">
          <LiveStatsRecorder 
            clubId={clubId}
            sessionId={activeSessionId}
            onSessionChange={setActiveSessionId}
          />
        </TabsContent>

        <TabsContent value="stats">
          <StatsCenter clubId={clubId} />
        </TabsContent>
      </Tabs>

      {/* Quick Start Modal */}
      {showQuickStart && (
        <QuickStartSession
          clubId={clubId}
          onClose={() => setShowQuickStart(false)}
          onSessionStarted={(sessionId) => {
            setActiveSessionId(sessionId);
            setActiveView('live');
            setShowQuickStart(false);
          }}
        />
      )}
    </div>
  );
};