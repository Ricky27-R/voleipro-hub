import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useClubInvitations } from '@/hooks/useClubInvitations';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const { createAssistantRequest } = useClubInvitations();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/club" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(email, password, firstName, lastName);

      if (error) {
        toast({
          title: "Error en el registro",
          description: error.message === "User already registered" 
            ? "Ya existe una cuenta con este email."
            : error.message,
          variant: "destructive",
        });
        return;
      }

      // Si hay código de invitación, crear solicitud
      if (invitationCode.trim()) {
        try {
          await createAssistantRequest(invitationCode);
          toast({
            title: "¡Registro exitoso!",
            description: "Te has registrado y enviado solicitud para unirte al club como entrenador asistente.",
          });
        } catch (invitationError) {
          toast({
            title: "Cuenta creada, pero error con la invitación",
            description: "Tu cuenta se creó correctamente, pero hubo un problema con el código de invitación. Contacta al entrenador principal.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Esperando aprobación como entrenador principal.",
        });
      }
    } catch (error) {
      toast({
        title: "Error en el registro",
        description: "Hubo un problema al crear tu cuenta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate en VoleiProManager como Entrenador Principal o usa un código para unirte como Asistente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Pérez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invitationCode">Código de Invitación (Opcional)</Label>
              <Input
                id="invitationCode"
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="Ingresa código para unirte como asistente"
              />
              <p className="text-xs text-muted-foreground">
                Si tienes un código de invitación, serás registrado como entrenador asistente
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;