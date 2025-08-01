import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRegisterTeam } from '@/hooks/useEvents';

const registrationSchema = z.object({
  team_id: z.string().min(1, 'Debes seleccionar un equipo'),
  questions: z.string().optional(),
});

interface TeamRegistrationFormProps {
  event: any;
  userTeams: any[];
  onClose: () => void;
}

export const TeamRegistrationForm = ({ event, userTeams, onClose }: TeamRegistrationFormProps) => {
  const registerTeam = useRegisterTeam();

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
    try {
      await registerTeam.mutateAsync({
        eventId: event.id,
        teamId: values.team_id,
        questions: values.questions,
      });
      onClose();
    } catch (error) {
      console.error('Error registering team:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Equipo</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <h3 className="font-semibold text-lg">{event.name}</h3>
          <p className="text-sm text-muted-foreground">
            {event.event_type === 'tournament' ? 'Torneo' : 'Tope'} en {event.city}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="team_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seleccionar Equipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Elige un equipo para registrar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.nombre} - {team.categoria} ({team.año})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preguntas para el Organizador (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="¿Tienes alguna pregunta sobre el evento? Ejemplo: horarios, equipamiento necesario, etc."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={registerTeam.isPending}>
                {registerTeam.isPending ? 'Registrando...' : 'Registrar Equipo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};