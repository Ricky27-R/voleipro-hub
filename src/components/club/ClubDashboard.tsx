import { useState } from 'react';
import { Club } from '@/hooks/useClub';
import { TeamsManager } from '../teams/TeamsManager';
import { PlayersManager } from '../players/PlayersManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Edit, 
  Users, 
  Home,
  ChevronRight,
  LogOut,
  UserCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface ClubDashboardProps {
  club: Club;
  onEdit: () => void;
}

type ActiveSection = 'overview' | 'teams' | 'players';

const sidebarItems = [
  { 
    id: 'overview' as const, 
    title: 'Información General', 
    icon: Home,
    description: 'Datos básicos del club'
  },
  { 
    id: 'teams' as const, 
    title: 'Equipos', 
    icon: Users,
    description: 'Gestionar equipos del club'
  },
  { 
    id: 'players' as const, 
    title: 'Jugadoras', 
    icon: UserCircle,
    description: 'Gestionar jugadoras del club'
  },
];

const ClubOverview = ({ club, onEdit }: { club: Club; onEdit: () => void }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Club</h1>
        <p className="text-muted-foreground mt-2">
          Información de tu club registrado.
        </p>
      </div>
      <Button onClick={onEdit} className="gap-2">
        <Edit className="h-4 w-4" />
        Editar Club
      </Button>
    </div>

    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          {club.logo_url ? (
            <img 
              src={club.logo_url} 
              alt={`Logo de ${club.nombre}`}
              className="h-16 w-16 object-cover rounded-full border-2 border-border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <CardTitle className="text-2xl">{club.nombre}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              Club Registrado
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Ciudad</p>
              <p className="text-sm text-muted-foreground">{club.ciudad}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Fecha de Creación</p>
              <p className="text-sm text-muted-foreground">
                {new Date(club.fecha_creacion).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Club registrado el {new Date(club.created_at).toLocaleDateString('es-ES')}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ClubSidebar = ({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: ActiveSection; 
  onSectionChange: (section: ActiveSection) => void;
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Panel de Control</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full ${
                      activeSection === item.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    )}
                    {!isCollapsed && activeSection === item.id && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export const ClubDashboard = ({ club, onEdit }: ClubDashboardProps) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const { signOut } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ClubOverview club={club} onEdit={onEdit} />;
      case 'teams':
        return <TeamsManager clubId={club.id} clubName={club.nombre} />;
      case 'players':
        return <PlayersManager clubId={club.id} clubName={club.nombre} />;
      default:
        return <ClubOverview club={club} onEdit={onEdit} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ClubSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center">
              <SidebarTrigger />
              <div className="ml-4">
                <h2 className="font-semibold text-foreground">{club.nombre}</h2>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </header>
          
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};