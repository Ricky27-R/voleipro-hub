import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Team } from '@/hooks/useTeams';

const teamSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  categoria: z.enum(['U12', 'U14', 'U16', 'U18', 'U20', 'Senior'], {
    required_error: 'Debe seleccionar una categoría',
  }),
  año: z.number().min(2020, 'El año debe ser 2020 o posterior').max(new Date().getFullYear() + 1, 'El año no puede ser futuro'),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormProps {
  team?: Team | null;
  clubId: string;
  onSubmit: (data: TeamFormData & { club_id: string }) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const categorias = [
  { value: 'U12', label: 'Sub-12' },
  { value: 'U14', label: 'Sub-14' },
  { value: 'U16', label: 'Sub-16' },
  { value: 'U18', label: 'Sub-18' },
  { value: 'U20', label: 'Sub-20' },
  { value: 'Senior', label: 'Senior' },
] as const;

export const TeamForm = ({ team, clubId, onSubmit, onCancel, loading }: TeamFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<string>(team?.categoria || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      nombre: team?.nombre || '',
      categoria: team?.categoria || undefined,
      año: team?.año || new Date().getFullYear(),
    },
  });

  const handleFormSubmit = async (data: TeamFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, club_id: clubId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoriaChange = (value: string) => {
    setSelectedCategoria(value);
    setValue('categoria', value as TeamFormData['categoria']);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{team ? 'Editar Equipo' : 'Crear Nuevo Equipo'}</CardTitle>
        <CardDescription>
          {team ? 'Actualiza los datos del equipo' : 'Completa los datos para crear un nuevo equipo'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Equipo *</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej: Águilas Doradas"
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select value={selectedCategoria} onValueChange={handleCategoriaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && (
              <p className="text-sm text-destructive">{errors.categoria.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="año">Año *</Label>
            <Input
              id="año"
              type="number"
              {...register('año', { valueAsNumber: true })}
              min="2020"
              max={new Date().getFullYear() + 1}
            />
            {errors.año && (
              <p className="text-sm text-destructive">{errors.año.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Guardando...' : (team ? 'Actualizar' : 'Crear Equipo')}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting || loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};