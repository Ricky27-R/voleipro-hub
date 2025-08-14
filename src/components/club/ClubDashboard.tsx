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
  X,
  Sun,
  Moon,
  Activity,
  Trophy,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatsManager } from '../stats/StatsManager';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { PerformanceTest } from '../PerformanceTest';

interface ClubDashboardProps {
  club: Club;
  onEdit: () => void;
}

type ActiveSection = 'overview' | 'teams' | 'players' | 'events' | 'invitations' | 'stats' | 'performance';

const sidebarItems = [
  { id: 'overview' as const, title: 'Información General', icon: Home, description: 'Vista general del club' },
  { id: 'teams' as const, title: 'Equipos', icon: Users, description: 'Gestionar equipos' },
  { id: 'players' as const, title: 'Jugadoras', icon: UserCircle, description: 'Administrar jugadoras' },
  { id: 'events' as const, title: 'Eventos', icon: Calendar, description: 'Calendario de eventos' },
  { id: 'invitations' as const, title: 'Entrenadores', icon: Users, description: 'Gestionar entrenadores' },
  { id: 'stats' as const, title: 'Estadísticas', icon: TrendingUp, description: 'Análisis y métricas' },
  { id: 'performance' as const, title: 'Rendimiento', icon: Activity, description: 'Test de rendimiento' },
];

const ClubOverview = ({ club, onEdit }: { club: Club; onEdit: () => void }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bienvenido a {club.nombre}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gestiona todos los aspectos de tu club desde este panel centralizado.
          </p>
        </div>
        <Button onClick={onEdit} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
          <Edit className="h-4 w-4" />
          Editar Club
        </Button>
      </div>

      {/* Main Club Card */}
      <Card className="w-full shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-6 p-8">
          {club.logo_url ? (
            <img 
              src={club.logo_url} 
              alt={`Logo de ${club.nombre}`}
              className="h-28 w-28 object-cover rounded-2xl shadow-lg border-4 border-white dark:border-gray-700"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="h-28 w-28 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {club.nombre}
            </CardTitle>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700">
              Club Activo
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Ciudad</p>
                <p className="font-semibold text-xl text-gray-900 dark:text-white">{club.ciudad}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Miembro desde</p>
                <p className="font-semibold text-xl text-gray-900 dark:text-white">
                  {new Date(club.fecha_creacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">12</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Equipos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500">
                <UserCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">156</p>
                <p className="text-sm text-green-700 dark:text-green-300">Jugadoras</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">8</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">Eventos Este Mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

const ClubSidebar = ({ activeSection, onSectionChange, isCollapsed, onToggle }: { 
  activeSection: ActiveSection; 
  onSectionChange: (section: ActiveSection) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen sticky top-0 shadow-xl"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VoleiPro
          </span>
        )}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle} 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'secondary' : 'ghost'}
            onClick={() => onSectionChange(item.id)}
            className={`w-full justify-start gap-3 h-12 ${
              activeSection === item.id 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && (
              <div className="flex flex-col items-start">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs opacity-75">{item.description}</span>
              </div>
            )}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="ghost" 
          onClick={signOut} 
          className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white h-12"
        >
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
        return <EventsManager clubId={club.id} />;
      case 'invitations':
        return <InvitationsManager />;
      case 'stats':
        return <StatsManager clubId={club.id} />;
      case 'performance':
        return <PerformanceTest clubId={club.id} />;
      default:
        return <ClubOverview club={club} onEdit={onEdit} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex w-full">
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
