import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { useSessions } from '@/hooks/useSessions';

interface StatsCenterProps {
  clubId: string;
}

export const StatsCenter: React.FC<StatsCenterProps> = ({ clubId }) => {
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  
  const { data: sessions } = useSessions(clubId);

  // Usamos solo datos reales desde Supabase (sesiones, acciones, etc.).
  // Por ahora, no mostramos datos simulados ni gráficos con valores ficticios.

  const filteredSessions = sessions?.filter(session => {
    if (selectedType !== 'all' && session.type !== selectedType) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo de sesión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="match">Partidos</SelectItem>
                <SelectItem value="training">Entrenamientos</SelectItem>
                <SelectItem value="scrimmage">Amistosos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rango de tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="season">Esta temporada</SelectItem>
                <SelectItem value="all">Todo el tiempo</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen real (sin datos ficticios) */}
      <Card>
        <CardHeader>
          <CardTitle>Sesiones recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Aún no hay sesiones registradas para los filtros seleccionados.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b last:border-b-0 py-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString()} • {s.type} • {s.location}
                    </div>
                  </div>
                  <Badge variant="secondary">{s.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};