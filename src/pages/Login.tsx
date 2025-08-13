import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/club" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error de autenticación",
        description: error.message === "Invalid login credentials" 
          ? "Credenciales incorrectas. Verifica tu email y contraseña."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión correctamente.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-screen-xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="md:w-1/2 flex flex-col justify-center items-start">
          <span className="text-sm uppercase tracking-widest text-neutral-400">Accede a tu plataforma</span>
          <h1 className="text-5xl lg:text-6xl font-bold mt-4">Bienvenido de <span className="text-cyan-400">vuelta</span></h1>
          <p className="mt-6 text-neutral-300 max-w-md">
            Accede a tu plataforma de gestión de voleibol y continúa transformando tu club con tecnología de vanguardia.
          </p>
          <ul className="mt-8 space-y-2 text-neutral-300">
            <li className="flex items-center gap-2">● Acceso seguro</li>
            <li className="flex items-center gap-2">● Datos protegidos</li>
            <li className="flex items-center gap-2">● Inicio instantáneo</li>
          </ul>
        </div>

        <div className="md:w-1/2 flex justify-center items-center">
          <div className="w-full max-w-md bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Iniciar Sesión</h2>
              <p className="text-neutral-400">Accede a tu plataforma de gestión de voleibol</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="mt-2 bg-neutral-800 border-neutral-700"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-neutral-400">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-cyan-400 hover:underline">
                Regístrate aquí
              </Link>
              <div className="mt-2">
                <Link to="#" className="hover:underline">
                  ¿Olvidaste tu contraseña? Recuperar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
