import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInvitations } from '@/hooks/useInvitations';
import { useNavigate } from 'react-router-dom';

export const AcceptInvitation = () => {
  const [code, setCode] = useState('');
  const { acceptInvitation, loading } = useInvitations();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    try {
      await acceptInvitation(code);
      navigate('/club');
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unirse a un Club</CardTitle>
          <CardDescription>
            Ingresa el código de invitación que recibiste del entrenador principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Invitación</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingresa el código aquí"
                required
              />
            </div>
            <Button type="submit" disabled={loading || !code.trim()} className="w-full">
              {loading ? 'Procesando...' : 'Unirse al Club'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};