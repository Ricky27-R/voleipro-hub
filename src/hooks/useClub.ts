import { useState, useEffect } from 'react';
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

export const useClub = () => {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserClub = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setClub(data as Club);
    } catch (error) {
      console.error('Error al obtener club:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el club",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClub = async (clubData: Omit<Club, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('clubs')
        .insert([{ ...clubData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setClub(data as Club);
      toast({
        title: "¡Éxito!",
        description: "Club creado correctamente",
      });
      return data;
    } catch (error: any) {
      console.error('Error al crear club:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el club",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateClub = async (clubData: Partial<Omit<Club, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!club) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clubs')
        .update(clubData)
        .eq('id', club.id)
        .select()
        .single();

      if (error) throw error;
      
      setClub(data as Club);
      toast({
        title: "¡Éxito!",
        description: "Club actualizado correctamente",
      });
      return data;
    } catch (error: any) {
      console.error('Error al actualizar club:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el club",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteClub = async () => {
    if (!club) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', club.id);

      if (error) throw error;
      
      setClub(null);
      toast({
        title: "¡Éxito!",
        description: "Club eliminado correctamente",
      });
    } catch (error: any) {
      console.error('Error al eliminar club:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el club",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserClub();
  }, []);

  return {
    club,
    loading,
    createClub,
    updateClub,
    refetch: fetchUserClub,
  };
};