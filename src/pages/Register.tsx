import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useClubInvitations } from '@/hooks/useClubInvitations';
import { SmartRedirect } from '@/components/auth/SmartRedirect';
import { supabase } from '@/integrations/supabase/client';
import { Users, Shield, User } from 'lucide-react';

type RegistrationType = 'entrenador_principal' | 'entrenador_asistente';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clubCode, setClubCode] = useState('');
  const [registrationType, setRegistrationType] = useState<RegistrationType>('entrenador_principal');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Creando cuenta...");
  const { signUp, user } = useAuth();
  const { createAssistantRequest } = useClubInvitations();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    return <SmartRedirect />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Creando cuenta...");

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

      // Handle different registration types
      if (registrationType === 'entrenador_principal') {
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "Ya puedes iniciar sesión para configurar tu club.",
        });
        
        // Redirigir automáticamente al login después de un breve momento
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
      } else if (registrationType === 'entrenador_asistente') {
        // For assistant coaches, use club code
        if (!clubCode.trim()) {
          toast({
            title: "Código requerido",
            description: "Necesitas un código del club para registrarte como entrenador asistente",
            variant: "destructive",
          });
          return;
        }

        // Guardar el código para aplicarlo después del primer login
        // Este enfoque es más confiable que esperar la sesión inmediatamente
        localStorage.setItem('pending_club_code', clubCode.trim());
        
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "Ahora inicia sesión con tu email y contraseña. El código del club se aplicará automáticamente después del login.",
        });
        
        // Redirigir automáticamente al login después de un breve momento
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
          <div className="w-full max-w-lg bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Crear Cuenta</h2>
              <p className="text-neutral-400">Regístrate en VoleiPro Hub</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Registration Type Selection */}
              <div>
                <Label className="text-base font-semibold">¿Cómo quieres registrarte?</Label>
                <RadioGroup 
                  value={registrationType} 
                  onValueChange={(value) => setRegistrationType(value as RegistrationType)}
                  className="mt-3"
                >
                  <Card className="bg-neutral-800/50 border-neutral-700">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="entrenador_principal" id="entrenador_principal" />
                        <div className="flex items-center gap-3 flex-1">
                          <Shield className="h-5 w-5 text-orange-400" />
                          <div>
                            <Label htmlFor="entrenador_principal" className="font-medium">
                              Entrenador Principal
                            </Label>
                            <p className="text-sm text-neutral-400">
                              Crea y gestiona tu propio club
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-neutral-800/50 border-neutral-700">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="entrenador_asistente" id="entrenador_asistente" />
                        <div className="flex items-center gap-3 flex-1">
                          <Users className="h-5 w-5 text-blue-400" />
                          <div>
                            <Label htmlFor="entrenador_asistente" className="font-medium">
                              Entrenador Asistente
                            </Label>
                            <p className="text-sm text-neutral-400">
                              Únete a un club con código
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>


                </RadioGroup>
              </div>

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
              
              {/* Club Code Field - Only show for assistant coaches */}
              {registrationType !== 'entrenador_principal' && (
                <div>
                  <Label htmlFor="clubCode">Código del Club *</Label>
                  <Input
                    id="clubCode"
                    type="text"
                    value={clubCode}
                    onChange={(e) => setClubCode(e.target.value)}
                    required
                    placeholder="Código proporcionado por el club"
                    className="mt-2 bg-neutral-800 border-neutral-700"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    El entrenador principal te proporcionará este código
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500" disabled={loading}>
                {loading ? loadingMessage : "Crear Cuenta"}
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
