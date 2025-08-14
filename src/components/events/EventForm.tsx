import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateEvent } from '@/hooks/useEvents';

const eventSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  event_type: z.enum(['tournament', 'tope']),
  description: z.string().optional(),
  date: z.string().min(1, 'La fecha es obligatoria'),
  location: z.string().min(1, 'La ubicación es obligatoria'),
  city: z.string().min(1, 'La ciudad es obligatoria'),
  max_participants: z.number().optional(),
  registration_deadline: z.string().optional(),
});

const benefitOptions = [
  'Alojamiento',
  'Comida',
  'Transporte local',
  'Arbitraje incluido',
  'Premios',
  'Certificados',
  'Material deportivo',
  'Seguro médico',
];

interface EventFormProps {
  onClose: () => void;
}

export const EventForm = ({ onClose }: EventFormProps) => {
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const createEvent = useCreateEvent();

  console.log('EventForm rendered, createEvent:', createEvent);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      event_type: 'tournament',
      description: '',
      date: '',
      location: '',
      city: '',
      max_participants: undefined,
      registration_deadline: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    try {
      console.log('EventForm onSubmit called with values:', values);
      console.log('Selected benefits:', selectedBenefits);
      
      await createEvent.mutateAsync({
        ...values,
        date: new Date(values.date).toISOString(),
        registration_deadline: values.registration_deadline 
          ? new Date(values.registration_deadline).toISOString() 
          : null,
        max_participants: values.max_participants || null,
        benefits: selectedBenefits,
      });
      
      console.log('Event created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits(prev => 
      prev.includes(benefit) 
        ? prev.filter(b => b !== benefit)
        : [...prev, benefit]
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="event-form-description">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <p id="event-form-description" className="sr-only">
            Formulario para crear un nuevo evento deportivo
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Copa de Verano 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Evento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tournament">Torneo</SelectItem>
                        <SelectItem value="tope">Tope</SelectItem>
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el evento, reglas especiales, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha del Evento</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registration_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Límite de Registro (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Bogotá" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación Específica</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Estadio El Campín" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="max_participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Participantes (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ej: 16"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="text-sm font-medium mb-3 block">
                Beneficios para Equipos Visitantes
              </Label>
              <div className="grid gap-2 md:grid-cols-2">
                {benefitOptions.map(benefit => (
                  <div key={benefit} className="flex items-center space-x-2">
                    <Checkbox
                      id={benefit}
                      checked={selectedBenefits.includes(benefit)}
                      onCheckedChange={() => toggleBenefit(benefit)}
                    />
                    <Label htmlFor={benefit} className="text-sm">
                      {benefit}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Creando...' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};