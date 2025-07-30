import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvitationFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading: boolean;
}

export const InvitationForm = ({ onSubmit, loading }: InvitationFormProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    await onSubmit(email);
    setEmail('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitar Entrenador Asistente</CardTitle>
        <CardDescription>
          Genera una invitación para que un entrenador se una a tu club como asistente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email del Entrenador</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="entrenador@ejemplo.com"
              required
            />
          </div>
          <Button type="submit" disabled={loading || !email.trim()}>
            {loading ? 'Generando...' : 'Generar Invitación'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};