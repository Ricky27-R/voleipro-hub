import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '@/hooks/usePlayers';

const playerSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  document_id: z.string().min(3, 'El documento debe tener al menos 3 caracteres'),
  birthdate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  position: z.enum(['Setter', 'Libero', 'Middle Blocker', 'Outside Hitter', 'Opposite'], {
    required_error: 'La posición es requerida',
  }),
  team_id: z.string().min(1, 'El equipo es requerido'),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  onSubmit: (data: PlayerFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Player>;
  teams: Array<{ id: string; nombre: string; categoria: string; año: number }>;
  isEditing?: boolean;
}

const POSITIONS = [
  'Setter',
  'Libero', 
  'Middle Blocker',
  'Outside Hitter',
  'Opposite'
] as const;

export function PlayerForm({ onSubmit, onCancel, initialData, teams, isEditing = false }: PlayerFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      document_id: initialData?.document_id || '',
      birthdate: initialData?.birthdate || '',
      position: initialData?.position || undefined,
      team_id: initialData?.team_id || '',
    }
  });

  const selectedPosition = watch('position');
  const selectedTeamId = watch('team_id');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Jugadora' : 'Nueva Jugadora'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Ingresa el nombre completo"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_id">Documento de Identidad</Label>
            <Input
              id="document_id"
              {...register('document_id')}
              placeholder="Cédula o ID único"
            />
            {errors.document_id && (
              <p className="text-sm text-destructive">{errors.document_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
            <Input
              id="birthdate"
              type="date"
              {...register('birthdate')}
            />
            {errors.birthdate && (
              <p className="text-sm text-destructive">{errors.birthdate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Posición</Label>
            <Select
              value={selectedPosition}
              onValueChange={(value) => setValue('position', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una posición" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-destructive">{errors.position.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Equipo</Label>
            <Select
              value={selectedTeamId}
              onValueChange={(value) => setValue('team_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un equipo" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.nombre} - {team.categoria} ({team.año})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team_id && (
              <p className="text-sm text-destructive">{errors.team_id.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}