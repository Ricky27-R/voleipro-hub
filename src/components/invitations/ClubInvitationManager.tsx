import { useClub } from '@/hooks/useClub';
import { useClubInvitations } from '@/hooks/useClubInvitations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Check, X } from 'lucide-react';
import { useState } from 'react';

export const ClubInvitationManager = () => {
  const { club } = useClub();
  const { 
    invitationCode, 
    assistantRequests, 
    loading, 
    generateInvitationCode, 
    approveAssistantRequest, 
    rejectAssistantRequest 
  } = useClubInvitations();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateCode = async () => {
    if (!club) return;
    await generateInvitationCode(club.id, club.nombre);
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleApprove = async (requestId: string) => {
    await approveAssistantRequest(requestId);
  };

  const handleReject = async (requestId: string) => {
    await rejectAssistantRequest(requestId);
  };

  if (!club) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Necesitas tener un club registrado para gestionar invitaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Entrenadores</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona el código de invitación y las solicitudes de entrenadores asistentes
        </p>
      </div>
      
      {/* Código de Invitación */}
      <Card>
        <CardHeader>
          <CardTitle>Código de Invitación del Club</CardTitle>
          <CardDescription>
            Comparte este código con entrenadores que quieran unirse a tu club como asistentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitationCode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="club-code">Código del Club</Label>
                <div className="flex gap-2">
                  <Input
                    id="club-code"
                    value={invitationCode.code}
                    readOnly
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(invitationCode.code)}
                  >
                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button 
                variant="secondary" 
                onClick={handleGenerateCode}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generar Nuevo Código
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleGenerateCode}
              disabled={loading}
              className="w-full"
            >
              Generar Código de Invitación
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Solicitudes Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Pendientes</CardTitle>
          <CardDescription>
            Entrenadores que han solicitado unirse a tu club
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assistantRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay solicitudes pendientes
            </p>
          ) : (
            <div className="space-y-4">
              {assistantRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {request.first_name} {request.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Solicitado el {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};