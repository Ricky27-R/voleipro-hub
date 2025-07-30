import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy } from 'lucide-react';
import { Invitation } from '@/hooks/useInvitations';
import { toast } from '@/hooks/use-toast';

interface InvitationsListProps {
  invitations: Invitation[];
  onDelete: (invitationId: string) => Promise<void>;
  loading: boolean;
}

export const InvitationsList = ({ invitations, onDelete, loading }: InvitationsListProps) => {
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "¡Copiado!",
      description: "Código copiado al portapapeles",
    });
  };

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No hay invitaciones pendientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Invitaciones</h3>
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{invitation.email}</CardTitle>
                <CardDescription>
                  Creada el {new Date(invitation.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={invitation.accepted ? "default" : "secondary"}>
                {invitation.accepted ? "Aceptada" : "Pendiente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                  {invitation.code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(invitation.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {!invitation.accepted && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(invitation.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};