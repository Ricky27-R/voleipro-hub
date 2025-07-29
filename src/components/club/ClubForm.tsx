import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Club } from '@/hooks/useClub';

const clubSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ciudad: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  logo_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  fecha_creacion: z.string(),
});

type ClubFormData = z.infer<typeof clubSchema>;

interface ClubFormProps {
  club?: Club | null;
  onSubmit: (data: ClubFormData) => Promise<void>;
  loading?: boolean;
}

export const ClubForm = ({ club, onSubmit, loading }: ClubFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      nombre: club?.nombre || '',
      ciudad: club?.ciudad || '',
      logo_url: club?.logo_url || '',
      fecha_creacion: club?.fecha_creacion ? new Date(club.fecha_creacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  const handleFormSubmit = async (data: ClubFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{club ? 'Editar Club' : 'Registrar Club'}</CardTitle>
        <CardDescription>
          {club ? 'Actualiza los datos de tu club' : 'Completa los datos para registrar tu club'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Club *</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Club Voleibol Campeones"
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad *</Label>
            <Input
              id="ciudad"
              {...register('ciudad')}
              placeholder="Buenos Aires"
            />
            {errors.ciudad && (
              <p className="text-sm text-destructive">{errors.ciudad.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL del Logo</Label>
            <Input
              id="logo_url"
              {...register('logo_url')}
              placeholder="https://ejemplo.com/logo.png"
            />
            {errors.logo_url && (
              <p className="text-sm text-destructive">{errors.logo_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_creacion">Fecha de Creación *</Label>
            <Input
              id="fecha_creacion"
              type="date"
              {...register('fecha_creacion')}
            />
            {errors.fecha_creacion && (
              <p className="text-sm text-destructive">{errors.fecha_creacion.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? 'Guardando...' : (club ? 'Actualizar Club' : 'Registrar Club')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};