import { useInvitations } from '@/hooks/useInvitations';
import { useClub } from '@/hooks/useClub';
import { InvitationForm } from './InvitationForm';
import { InvitationsList } from './InvitationsList';

export const InvitationsManager = () => {
  const { club } = useClub();
  const { invitations, loading, createInvitation, deleteInvitation } = useInvitations();

  const handleCreateInvitation = async (email: string) => {
    if (!club) return;
    await createInvitation(email, club.id);
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
          Invita entrenadores asistentes a tu club
        </p>
      </div>
      
      <InvitationForm onSubmit={handleCreateInvitation} loading={loading} />
      <InvitationsList 
        invitations={invitations} 
        onDelete={deleteInvitation} 
        loading={loading} 
      />
    </div>
  );
};