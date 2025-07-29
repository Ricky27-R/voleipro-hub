import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">VoleiProManager</h1>
        <p className="text-xl text-muted-foreground">Gestión integral de clubes de voleibol</p>
        <div className="space-y-4">
          <Link to="/club">
            <Button className="w-full">
              Gestionar Mi Club
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
