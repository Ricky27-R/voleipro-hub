import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInjuryLogs } from '@/hooks/useInjuryLogs';

const injuryLogSchema = z.object({
  injury_date: z.string().min(1, 'La fecha de lesión es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  recovery_status: z.enum(['recovering', 'recovered', 'chronic']),
  expected_recovery_date: z.string().optional(),
  notes: z.string().optional(),
});

type InjuryLogFormData = z.infer<typeof injuryLogSchema>;

interface InjuryLogFormProps {
  playerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InjuryLogForm = ({ playerId, isOpen, onClose }: InjuryLogFormProps) => {
  const { createInjuryLog } = useInjuryLogs(playerId);
  const [loading, setLoading] = useState(false);

  const form = useForm<InjuryLogFormData>({
    resolver: zodResolver(injuryLogSchema),
    defaultValues: {
      injury_date: '',
      description: '',
      recovery_status: 'recovering',
      expected_recovery_date: '',
      notes: '',
    },
  });

  const onSubmit = async (data: InjuryLogFormData) => {
    try {
      setLoading(true);
      await createInjuryLog({
        player_id: playerId,
        injury_date: data.injury_date,
        description: data.description,
        recovery_status: data.recovery_status,
        expected_recovery_date: data.expected_recovery_date || undefined,
        notes: data.notes || undefined,
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error creating injury log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Lesión</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="injury_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Lesión</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recovery_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Recuperación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="recovering">En recuperación</SelectItem>
                        <SelectItem value="recovered">Recuperada</SelectItem>
                        <SelectItem value="chronic">Crónica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de la Lesión</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe la lesión, causa, gravedad..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expected_recovery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Esperada de Recuperación (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tratamiento, recomendaciones del médico, etc."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Lesión'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};