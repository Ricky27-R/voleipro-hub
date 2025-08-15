import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Plus, Shield, Eye, EyeOff } from 'lucide-react';

interface ClubCodeManagerProps {
  clubId: string;
}

interface ClubCode {
  id: string;
  code: string;
  role_type: 'entrenador_asistente';
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export const ClubCodeManager: React.FC<ClubCodeManagerProps> = ({ clubId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<ClubCode[]>([]);
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});

  // Form state - only for assistant coaches
  const [maxUses, setMaxUses] = useState('1');

  // Load existing codes
  React.useEffect(() => {
    loadCodes();
  }, [clubId]);

  const loadCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('club_codes')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error('Error loading codes:', error);
    }
  };

  const generateCode = async () => {
    setLoading(true);
    try {
      const { data: newCode, error } = await supabase.rpc('generate_club_code', {
        p_club_id: clubId,
        p_max_uses: parseInt(maxUses)
      });

      if (error) throw error;

      toast({
        title: "¡Código generado!",
        description: `Código ${newCode} creado exitosamente para entrenador asistente`,
      });

      // Reset form
      setMaxUses('1');

      // Reload codes
      loadCodes();
    } catch (error: any) {
      toast({
        title: "Error al generar código",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "¡Copiado!",
        description: "Código copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive"
      });
    }
  };

  const toggleCodeVisibility = (codeId: string) => {
    setShowCodes(prev => ({
      ...prev,
      [codeId]: !prev[codeId]
    }));
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generar Código para Entrenador Asistente
          </CardTitle>
          <CardDescription>
            Crea códigos de invitación para que entrenadores asistentes se unan a tu club
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Usuario</Label>
              <div className="mt-2 p-3 border rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Entrenador Asistente</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Los códigos son solo para entrenadores asistentes
                </p>
              </div>
            </div>

            <div>
              <Label>Máximo de Usos</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <Button onClick={generateCode} disabled={loading} className="w-full">
            {loading ? "Generando..." : "Generar Código"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Códigos de Entrenadores Asistentes</CardTitle>
          <CardDescription>
            Gestiona los códigos activos para entrenadores asistentes ({codes.length} códigos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {codes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay códigos de entrenador generados aún
              </p>
            ) : (
              codes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {showCodes[code.id] ? code.code : '••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCodeVisibility(code.id)}
                      >
                        {showCodes[code.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <Badge variant={code.is_active ? 'default' : 'secondary'}>
                        {code.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <span>Usos: {code.current_uses}/{code.max_uses}</span>
                      <span>Expira: {formatDate(code.expires_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
