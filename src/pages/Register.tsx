import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useClubInvitations } from '@/hooks/useClubInvitations';
import { supabase } from '@/integrations/supabase/client';

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
          // Refresh the session to ensure authentication state is synchronized
          await supabase.auth.getSession();
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
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-screen-xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="md:w-1/2 flex flex-col justify-center items-start">
          <span className="text-sm uppercase tracking-widest text-neutral-400">Crea tu cuenta</span>
          <h1 className="text-5xl lg:text-6xl font-bold mt-4">Únete a la <span className="text-orange-400">élite</span></h1>
          <p className="mt-6 text-neutral-300 max-w-md">
            Regístrate para empezar a gestionar tu club como un profesional.
          </p>
          <ul className="mt-8 space-y-2 text-neutral-300">
            <li className="flex items-center gap-2">● Gestión de equipos y jugadoras</li>
            <li className="flex items-center gap-2">● Estadísticas avanzadas</li>
            <li className="flex items-center gap-2">● Colaboración en tiempo real</li>
          </ul>
        </div>
        <div className="md:w-1/2 flex justify-center items-center">
          <div className="w-full max-w-md bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Crear Cuenta</h2>
              <p className="text-neutral-400">Regístrate como Entrenador Principal o usa un código para unirte como Asistente</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Juan"
                    className="mt-2 bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Pérez"
                    className="mt-2 bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="mt-2 bg-neutral-800 border-neutral-700"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="mt-2 bg-neutral-800 border-neutral-700"
                />
              </div>
              <div>
                <Label htmlFor="invitationCode">Código de Invitación (Opcional)</Label>
                <Input
                  id="invitationCode"
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="Ingresa código para unirte como asistente"
                  className="mt-2 bg-neutral-800 border-neutral-700"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-neutral-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-cyan-400 hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
