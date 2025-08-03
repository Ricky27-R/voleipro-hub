import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Player } from '@/hooks/usePlayers';

const playerSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  document_id: z.string().min(3, 'El documento debe tener al menos 3 caracteres'),
  birthdate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  position: z.enum(['Setter', 'Libero', 'Middle Blocker', 'Outside Hitter', 'Opposite'], {
    required_error: 'La posición es requerida',
  }),
  team_id: z.string().min(1, 'El equipo es requerido'),
  jersey_number: z.number().min(1).max(99).optional(),
  height_cm: z.number().min(140).max(220).optional(),
  weight_kg: z.number().min(40).max(120).optional(),
  reach_cm: z.number().min(180).max(280).optional(),
  jump_cm: z.number().min(20).max(80).optional(),
  allergies: z.string().optional(),
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
      jersey_number: initialData?.jersey_number || undefined,
      height_cm: initialData?.height_cm || undefined,
      weight_kg: initialData?.weight_kg || undefined,
      reach_cm: initialData?.reach_cm || undefined,
      jump_cm: initialData?.jump_cm || undefined,
      allergies: initialData?.allergies || '',
    }
  });

  const selectedPosition = watch('position');
  const selectedTeamId = watch('team_id');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Jugadora' : 'Nueva Jugadora'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="physical">Datos Físicos</TabsTrigger>
              <TabsTrigger value="medical">Información Médica</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo *</Label>
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
                  <Label htmlFor="document_id">Documento de Identidad *</Label>
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
                  <Label htmlFor="birthdate">Fecha de Nacimiento *</Label>
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
                  <Label htmlFor="jersey_number">Número de Camiseta</Label>
                  <Input
                    id="jersey_number"
                    type="number"
                    min="1"
                    max="99"
                    {...register('jersey_number', { valueAsNumber: true })}
                    placeholder="Ej: 10"
                  />
                  {errors.jersey_number && (
                    <p className="text-sm text-destructive">{errors.jersey_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Posición *</Label>
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
                  <Label>Equipo *</Label>
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
              </div>
            </TabsContent>

            <TabsContent value="physical" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height_cm">Altura (cm)</Label>
                  <Input
                    id="height_cm"
                    type="number"
                    min="140"
                    max="220"
                    {...register('height_cm', { valueAsNumber: true })}
                    placeholder="Ej: 175"
                  />
                  {errors.height_cm && (
                    <p className="text-sm text-destructive">{errors.height_cm.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Peso (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    min="40"
                    max="120"
                    step="0.1"
                    {...register('weight_kg', { valueAsNumber: true })}
                    placeholder="Ej: 65.5"
                  />
                  {errors.weight_kg && (
                    <p className="text-sm text-destructive">{errors.weight_kg.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reach_cm">Alcance (cm)</Label>
                  <Input
                    id="reach_cm"
                    type="number"
                    min="180"
                    max="280"
                    {...register('reach_cm', { valueAsNumber: true })}
                    placeholder="Ej: 230"
                  />
                  {errors.reach_cm && (
                    <p className="text-sm text-destructive">{errors.reach_cm.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jump_cm">Salto (cm)</Label>
                  <Input
                    id="jump_cm"
                    type="number"
                    min="20"
                    max="80"
                    {...register('jump_cm', { valueAsNumber: true })}
                    placeholder="Ej: 45"
                  />
                  {errors.jump_cm && (
                    <p className="text-sm text-destructive">{errors.jump_cm.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    {...register('allergies')}
                    placeholder="Describe cualquier alergia conocida..."
                    className="min-h-[100px]"
                  />
                  {errors.allergies && (
                    <p className="text-sm text-destructive">{errors.allergies.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Jugadora' : 'Crear Jugadora')}
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