import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, MessageCircle, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEventRegistrations, useRegisterTeam } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { TeamRegistrationForm } from './TeamRegistrationForm';
import { EventChat } from './EventChat';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EventCardProps {
  event: any;
  userTeams: any[];
}

export const EventCard = ({ event, userTeams }: EventCardProps) => {
  const { user } = useAuth();
  const { data: registrations } = useEventRegistrations(event.id);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const isOrganizer = user?.id === event.organizer_id;
  const userRegistration = registrations?.find(reg => reg.registering_coach_id === user?.id);
  const isRegistered = !!userRegistration;
  const canRegister = !isRegistered && !isOrganizer && userTeams.length > 0;
  
  const registrationDeadlinePassed = event.registration_deadline && 
    new Date(event.registration_deadline) < new Date();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const eventTypeBadge = event.event_type === 'tournament' 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-purple-100 text-purple-800';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <Badge className={eventTypeBadge}>
                {event.event_type === 'tournament' ? 'Torneo' : 'Tope'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.date), 'PPP', { locale: es })}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.city}
              </div>
              {event.max_participants && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {registrations?.length || 0}/{event.max_participants}
                </div>
              )}
            </div>
          </div>
          {isRegistered && (
            <Badge className={getStatusBadge(userRegistration.status)}>
              {userRegistration.status === 'pending' && 'Pendiente'}
              {userRegistration.status === 'accepted' && 'Aceptado'}
              {userRegistration.status === 'rejected' && 'Rechazado'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Organizador:</p>
          <p className="font-medium">
            {event.organizer?.first_name} {event.organizer?.last_name} - {event.organizer_club?.nombre}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Ubicación:</p>
          <p>{event.location}</p>
        </div>

        {event.description && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Descripción:</p>
            <p className="text-sm">{event.description}</p>
          </div>
        )}

        {event.benefits && event.benefits.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Beneficios para equipos visitantes:</p>
            <div className="flex flex-wrap gap-1">
              {event.benefits.map((benefit: string) => (
                <Badge key={`${event.id}-${benefit}`} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {event.registration_deadline && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Fecha límite de registro: {format(new Date(event.registration_deadline), 'PPP', { locale: es })}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {canRegister && !registrationDeadlinePassed && (
              <Button onClick={() => setShowRegistrationForm(true)}>
                Registrar Equipo
              </Button>
            )}
            
            {(isRegistered || isOrganizer) && (
              <Button variant="outline" onClick={() => setShowChat(true)} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
            )}
          </div>

          {isOrganizer && (
            <p className="text-sm text-muted-foreground">
              {registrations?.length || 0} equipos registrados
            </p>
          )}
        </div>
      </CardContent>

      {showRegistrationForm && (
        <TeamRegistrationForm
          event={event}
          userTeams={userTeams}
          onClose={() => setShowRegistrationForm(false)}
        />
      )}

      {showChat && (isRegistered || isOrganizer) && (
        <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Chat del Evento - {event.name}</DialogTitle>
            </DialogHeader>
            <EventChat eventId={event.id} />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};