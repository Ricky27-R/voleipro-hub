import { useState } from 'react';
import { Club } from '@/hooks/useClub';
import { EnhancedTeamsManager } from '../teams/EnhancedTeamsManager';
import { PlayersManager } from '../players/PlayersManager';
import { InvitationsManager } from '../invitations/InvitationsManager';
import EventsManager from '../events/EventsManager';
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
  TrendingUp,
  LogOut,
  UserCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatsManager } from '../stats/StatsManager';
import { AnimatePresence, motion } from 'framer-motion';

interface ClubDashboardProps {
  club: Club;
  onEdit: () => void;
}

type ActiveSection = 'overview' | 'teams' | 'players' | 'events' | 'invitations' | 'stats';

const sidebarItems = [
  { id: 'overview' as const, title: 'Información General', icon: Home },
  { id: 'teams' as const, title: 'Equipos', icon: Users },
  { id: 'players' as const, title: 'Jugadoras', icon: UserCircle },
  { id: 'events' as const, title: 'Eventos', icon: Calendar },
  { id: 'invitations' as const, title: 'Entrenadores', icon: Users },
  { id: 'stats' as const, title: 'Estadísticas', icon: TrendingUp },
];

const ClubOverview = ({ club, onEdit }: { club: Club; onEdit: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-8"
  >
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Bienvenido a {club.nombre}</h1>
        <p className="text-neutral-400 mt-2">
          Gestiona todos los aspectos de tu club desde este panel.
        </p>
      </div>
      <Button onClick={onEdit} className="gap-2 bg-white/10 hover:bg-white/20 text-white">
        <Edit className="h-4 w-4" />
        Editar Club
      </Button>
    </div>

    <Card className="w-full bg-neutral-900/50 border-neutral-800 text-white">
      <CardHeader className="flex flex-row items-center gap-6 p-6">
        {club.logo_url ? (
          <img 
            src={club.logo_url} 
            alt={`Logo de ${club.nombre}`}
            className="h-24 w-24 object-cover rounded-full border-4 border-neutral-700"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="h-24 w-24 bg-neutral-800 rounded-full flex items-center justify-center">
            <Building2 className="h-12 w-12 text-neutral-500" />
          </div>
        )}
        <div>
          <CardTitle className="text-3xl font-bold">{club.nombre}</CardTitle>
          <Badge variant="secondary" className="mt-2 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            Club Activo
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4">
          <MapPin className="h-8 w-8 text-cyan-400" />
          <div>
            <p className="text-sm text-neutral-400">Ciudad</p>
            <p className="font-semibold text-lg">{club.ciudad}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Calendar className="h-8 w-8 text-cyan-400" />
          <div>
            <p className="text-sm text-neutral-400">Miembro desde</p>
            <p className="font-semibold text-lg">
              {new Date(club.fecha_creacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ClubSidebar = ({ activeSection, onSectionChange, isCollapsed, onToggle }: { 
  activeSection: ActiveSection; 
  onSectionChange: (section: ActiveSection) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) => {
  const { signOut } = useAuth();

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-neutral-950 border-r border-neutral-800 flex flex-col h-screen sticky top-0"
    >
      <div className="p-4 flex items-center justify-between h-16 border-b border-neutral-800">
        {!isCollapsed && <span className="font-bold text-xl text-white">VoleiPro</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-neutral-400 hover:text-white">
          {isCollapsed ? <Menu /> : <X />}
        </Button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'secondary' : 'ghost'}
            onClick={() => onSectionChange(item.id)}
            className={`w-full justify-start gap-3 ${activeSection === item.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span>{item.title}</span>}
          </Button>
        ))}
      </nav>
      <div className="p-4 border-t border-neutral-800">
        <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-3 text-neutral-400 hover:bg-neutral-800 hover:text-white">
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </Button>
      </div>
    </motion.div>
  );
};

export const ClubDashboard = ({ club, onEdit }: ClubDashboardProps) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ClubOverview club={club} onEdit={onEdit} />;
      case 'teams':
        return <EnhancedTeamsManager clubId={club.id} clubName={club.nombre} />;
      case 'players':
        return <PlayersManager clubId={club.id} clubName={club.nombre} />;
      case 'events':
        return <EventsManager />;
      case 'invitations':
        return <InvitationsManager />;
      case 'stats':
        return <StatsManager clubId={club.id} />;
      default:
        return <ClubOverview club={club} onEdit={onEdit} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex w-full">
      <ClubSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
    </div>
  );
};
