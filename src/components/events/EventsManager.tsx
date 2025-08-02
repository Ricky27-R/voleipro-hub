import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Plus, Search, Filter } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';
import { EventForm } from './EventForm';
import { EventCard } from './EventCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EventsManager = () => {
  const { data: events, isLoading } = useEvents();
  const { teams } = useTeams();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCity, setFilterCity] = useState('all');

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer_club?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.event_type === filterType;
    const matchesCity = filterCity === 'all' || event.city === filterCity;
    
    return matchesSearch && matchesType && matchesCity;
  });

  const cities = [...new Set(events?.map(event => event.city) || [])];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Evento
        </Button>
      </div>

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

      {/* Events Grid */}
      <div className="grid gap-6">
        {filteredEvents?.map(event => (
          <EventCard key={event.id} event={event} userTeams={teams || []} />
        ))}
        
        {filteredEvents?.length === 0 && (
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