import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Club {
  id: string;
  user_id: string;
  
  // Información General del Club
  nombre: string;
  ciudad: string;
  provincia_region: string;
  pais: string;
  direccion_principal: string;
  fecha_fundacion: string;
  
  // Información de Contacto
  email_institucional: string;
  telefono_whatsapp: string;
  sitio_web?: string;
  redes_sociales?: string;
  
  // Documentación y Verificación
  logo_url?: string;
  archivo_estatuto?: string;
  ruc_registro_legal?: string;
  tipo_club: 'formativo' | 'competitivo' | 'escolar' | 'universitario' | 'recreativo' | 'otro';
  
  // Representante del Club
  nombre_representante: string;
  cedula_identificacion: string;
  email_personal: string;
  telefono_personal: string;
  cargo_club: string;
  aceptacion_terminos: boolean;
  
  // Campos existentes
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
}

// Fetch user's club
const fetchUserClub = async (): Promise<Club | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data as Club;
};

export const useClub = () => {
  return useQuery({
    queryKey: ['club'],
    queryFn: fetchUserClub,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useCreateClub = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clubData: Omit<Club, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('clubs')
        .insert([{ ...clubData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Club;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['club'], data);
      toast({
        title: "¡Éxito!",
        description: "Club creado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el club",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateClub = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      clubId,
      clubData,
    }: {
      clubId: string;
      clubData: Partial<Omit<Club, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
    }) => {
      const { data, error } = await supabase
        .from('clubs')
        .update(clubData)
        .eq('id', clubId)
        .select()
        .single();

      if (error) throw error;
      return data as Club;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['club'], data);
      toast({
        title: "¡Éxito!",
        description: "Club actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el club",
        variant: "destructive",
      });
    },
  });
};