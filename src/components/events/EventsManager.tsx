import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Plus, Search, Filter, Database } from 'lucide-react';
import { useEvents, useTestConnection } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';
import { EventForm } from './EventForm';
import { EventCard } from './EventCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventsManagerProps {
  clubId: string;
}

const EventsManager = ({ clubId }: EventsManagerProps) => {
  const { data: events, isLoading, error, refetch } = useEvents();
  const { teams } = useTeams(clubId);
  const { data: connectionTest, error: connectionError } = useTestConnection();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCity, setFilterCity] = useState('all');

  console.log('EventsManager render:', { 
    events, 
    isLoading, 
    error, 
    clubId, 
    connectionTest, 
    connectionError 
  });

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer_club?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.event_type === filterType;
    const matchesCity = filterCity === 'all' || event.city === filterCity;
    
    return matchesSearch && matchesType && matchesCity;
  });

  const cities = [...new Set(events?.map(event => event.city) || [])];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Eventos</h1>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Evento
          </Button>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('EventsManager error:', error);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Eventos</h1>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Evento
          </Button>
        </div>
        
        {/* Connection Test Info */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Estado de Conexión</span>
            </div>
            {connectionError ? (
              <p className="text-sm text-red-600">
                ❌ Error de conexión: {connectionError.message}
              </p>
            ) : connectionTest ? (
              <p className="text-sm text-green-600">
                ✅ Conexión exitosa a la base de datos
              </p>
            ) : (
              <p className="text-sm text-yellow-600">
                ⏳ Probando conexión...
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar eventos</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'No se pudieron cargar los eventos. Por favor, intenta de nuevo.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetch()}>
                Reintentar
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Recargar página
              </Button>
            </div>
            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
              <p className="font-semibold">Detalles del error:</p>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <Button 
          onClick={() => {
            console.log('Create event button clicked');
            setShowCreateForm(true);
          }} 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Crear Evento
        </Button>
      </div>

      {/* Debug Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Eventos cargados: {events?.length || 0} | 
            Club ID: {clubId} | 
            Equipos disponibles: {teams?.length || 0} |
            Conexión: {connectionError ? '❌' : connectionTest ? '✅' : '⏳'}
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="tournament">Torneos</SelectItem>
                <SelectItem value="tope">Topes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger>
                <SelectValue placeholder="Ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ciudades</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterCity('all');
            }}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Count */}
      <div className="text-sm text-muted-foreground">
        {filteredEvents?.length || 0} evento{(filteredEvents?.length || 0) !== 1 ? 's' : ''} encontrado{(filteredEvents?.length || 0) !== 1 ? 's' : ''}
        {searchTerm || filterType !== 'all' || filterCity !== 'all' && ' con los filtros aplicados'}
      </div>

      {/* Events Grid */}
      <div className="grid gap-6">
        {filteredEvents?.map(event => (
          <EventCard key={event.id} event={event} userTeams={teams || []} />
        ))}
        
        {(!filteredEvents || filteredEvents.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' || filterCity !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Sé el primero en crear un evento para tu comunidad.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {showCreateForm && (
        <EventForm onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
};

export default EventsManager;