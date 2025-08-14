import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Phone, Mail, Globe, FileText, User, Shield } from 'lucide-react';
import { Club } from '@/hooks/useClub';

const clubSchema = z.object({
  // Información General del Club
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ciudad: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  provincia_region: z.string().min(2, 'La provincia/región es obligatoria'),
  pais: z.string().min(2, 'El país es obligatorio'),
  direccion_principal: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  fecha_fundacion: z.string().min(1, 'La fecha de fundación es obligatoria'),
  
  // Información de Contacto
  email_institucional: z.string().email('Debe ser un email válido'),
  telefono_whatsapp: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos'),
  sitio_web: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  redes_sociales: z.string().optional(),
  
  // Documentación y Verificación
  logo_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  archivo_estatuto: z.string().optional(),
  ruc_registro_legal: z.string().optional(),
  tipo_club: z.enum(['formativo', 'competitivo', 'escolar', 'universitario', 'recreativo', 'otro']),
  
  // Representante del Club
  nombre_representante: z.string().min(2, 'El nombre del representante es obligatorio'),
  cedula_identificacion: z.string().min(5, 'La cédula/identificación es obligatoria'),
  email_personal: z.string().email('Debe ser un email válido'),
  telefono_personal: z.string().min(7, 'El teléfono personal es obligatorio'),
  cargo_club: z.string().min(2, 'El cargo en el club es obligatorio'),
  aceptacion_terminos: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
});

type ClubFormData = z.infer<typeof clubSchema>;

interface ClubFormProps {
  club?: Club | null;
  onSubmit: (data: ClubFormData) => Promise<void>;
  loading?: boolean;
}

const paises = [
  'Ecuador', 'Perú', 'Colombia', 'Venezuela', 'Chile', 'Argentina', 'Brasil', 'México', 'España', 'Estados Unidos'
];

const provinciasEcuador = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galápagos', 
  'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 
  'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
];

export const ClubForm = ({ club, onSubmit, loading }: ClubFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      nombre: club?.nombre || '',
      ciudad: club?.ciudad || '',
      provincia_region: club?.provincia_region || '',
      pais: club?.pais || 'Ecuador',
      direccion_principal: club?.direccion_principal || '',
      fecha_fundacion: club?.fecha_fundacion ? new Date(club.fecha_fundacion).toISOString().split('T')[0] : '',
      email_institucional: club?.email_institucional || '',
      telefono_whatsapp: club?.telefono_whatsapp || '',
      sitio_web: club?.sitio_web || '',
      redes_sociales: club?.redes_sociales || '',
      logo_url: club?.logo_url || '',
      archivo_estatuto: club?.archivo_estatuto || '',
      ruc_registro_legal: club?.ruc_registro_legal || '',
      tipo_club: club?.tipo_club || 'formativo',
      nombre_representante: club?.nombre_representante || '',
      cedula_identificacion: club?.cedula_identificacion || '',
      email_personal: club?.email_personal || '',
      telefono_personal: club?.telefono_personal || '',
      cargo_club: club?.cargo_club || '',
      aceptacion_terminos: club?.aceptacion_terminos || false,
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

  const selectedPais = watch('pais');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {club ? 'Editar Información del Club' : 'Registrar Nuevo Club'}
          </CardTitle>
          <CardDescription>
            {club ? 'Actualiza la información detallada de tu club' : 'Completa toda la información para registrar tu club'}
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Información General del Club */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información General del Club
            </CardTitle>
            <CardDescription>
              Datos básicos de identificación del club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                  placeholder="Ej: Cuenca"
                />
                {errors.ciudad && (
                  <p className="text-sm text-destructive">{errors.ciudad.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <Select value={watch('pais')} onValueChange={(value) => setValue('pais', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {paises.map(pais => (
                      <SelectItem key={pais} value={pais}>{pais}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pais && (
                  <p className="text-sm text-destructive">{errors.pais.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia_region">Provincia/Región *</Label>
                <Select value={watch('provincia_region')} onValueChange={(value) => setValue('provincia_region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPais === 'Ecuador' ? (
                      provinciasEcuador.map(provincia => (
                        <SelectItem key={provincia} value={provincia}>{provincia}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="otro">Otra</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.provincia_region && (
                  <p className="text-sm text-destructive">{errors.provincia_region.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion_principal">Dirección Principal / Sede *</Label>
                <Input
                  id="direccion_principal"
                  {...register('direccion_principal')}
                  placeholder="Ej: Av. Principal 123, Zona Centro"
                />
                {errors.direccion_principal && (
                  <p className="text-sm text-destructive">{errors.direccion_principal.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fundacion">Fecha de Fundación *</Label>
                <Input
                  id="fecha_fundacion"
                  type="date"
                  {...register('fecha_fundacion')}
                />
                {errors.fecha_fundacion && (
                  <p className="text-sm text-destructive">{errors.fecha_fundacion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_club">Tipo de Club *</Label>
                <Select value={watch('tipo_club')} onValueChange={(value) => setValue('tipo_club', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formativo">Formativo</SelectItem>
                    <SelectItem value="competitivo">Competitivo</SelectItem>
                    <SelectItem value="escolar">Escolar</SelectItem>
                    <SelectItem value="universitario">Universitario</SelectItem>
                    <SelectItem value="recreativo">Recreativo</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_club && (
                  <p className="text-sm text-destructive">{errors.tipo_club.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Información de Contacto
            </CardTitle>
            <CardDescription>
              Datos para comunicación oficial del club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email_institucional">Correo Electrónico Institucional *</Label>
                <Input
                  id="email_institucional"
                  type="email"
                  {...register('email_institucional')}
                  placeholder="club@ejemplo.com"
                />
                {errors.email_institucional && (
                  <p className="text-sm text-destructive">{errors.email_institucional.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono_whatsapp">Teléfono o WhatsApp *</Label>
                <Input
                  id="telefono_whatsapp"
                  {...register('telefono_whatsapp')}
                  placeholder="+593 99 123 4567"
                />
                {errors.telefono_whatsapp && (
                  <p className="text-sm text-destructive">{errors.telefono_whatsapp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitio_web">Sitio Web</Label>
                <Input
                  id="sitio_web"
                  {...register('sitio_web')}
                  placeholder="https://www.clubejemplo.com"
                />
                {errors.sitio_web && (
                  <p className="text-sm text-destructive">{errors.sitio_web.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="redes_sociales">Redes Sociales</Label>
                <Input
                  id="redes_sociales"
                  {...register('redes_sociales')}
                  placeholder="Facebook, Instagram, Twitter"
                />
                {errors.redes_sociales && (
                  <p className="text-sm text-destructive">{errors.redes_sociales.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentación y Verificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentación y Verificación
            </CardTitle>
            <CardDescription>
              Archivos y documentos del club (opcionales)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo del Club</Label>
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
                <Label htmlFor="archivo_estatuto">Archivo de Estatuto/Acta</Label>
                <Input
                  id="archivo_estatuto"
                  {...register('archivo_estatuto')}
                  placeholder="URL del archivo"
                />
                {errors.archivo_estatuto && (
                  <p className="text-sm text-destructive">{errors.archivo_estatuto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruc_registro_legal">RUC / Registro Legal</Label>
                <Input
                  id="ruc_registro_legal"
                  {...register('ruc_registro_legal')}
                  placeholder="Número de registro legal"
                />
                {errors.ruc_registro_legal && (
                  <p className="text-sm text-destructive">{errors.ruc_registro_legal.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Representante del Club */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Representante del Club
            </CardTitle>
            <CardDescription>
              Información de la persona responsable del club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre_representante">Nombre Completo *</Label>
                <Input
                  id="nombre_representante"
                  {...register('nombre_representante')}
                  placeholder="Juan Pérez González"
                />
                {errors.nombre_representante && (
                  <p className="text-sm text-destructive">{errors.nombre_representante.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula_identificacion">Cédula o Identificación *</Label>
                <Input
                  id="cedula_identificacion"
                  {...register('cedula_identificacion')}
                  placeholder="1234567890"
                />
                {errors.cedula_identificacion && (
                  <p className="text-sm text-destructive">{errors.cedula_identificacion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_personal">Correo Personal *</Label>
                <Input
                  id="email_personal"
                  type="email"
                  {...register('email_personal')}
                  placeholder="juan.perez@email.com"
                />
                {errors.email_personal && (
                  <p className="text-sm text-destructive">{errors.email_personal.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono_personal">Teléfono Personal *</Label>
                <Input
                  id="telefono_personal"
                  {...register('telefono_personal')}
                  placeholder="+593 99 123 4567"
                />
                {errors.telefono_personal && (
                  <p className="text-sm text-destructive">{errors.telefono_personal.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo_club">Cargo en el Club *</Label>
                <Input
                  id="cargo_club"
                  {...register('cargo_club')}
                  placeholder="Presidente, Coordinador, etc."
                />
                {errors.cargo_club && (
                  <p className="text-sm text-destructive">{errors.cargo_club.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Términos y Condiciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Términos y Condiciones
            </CardTitle>
            <CardDescription>
              Confirmación de aceptación de términos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aceptacion_terminos"
                checked={watch('aceptacion_terminos')}
                onCheckedChange={(checked) => setValue('aceptacion_terminos', checked as boolean)}
              />
              <Label htmlFor="aceptacion_terminos" className="text-sm">
                Acepto los términos y condiciones del uso de la plataforma VoleiPro Hub *
              </Label>
            </div>
            {errors.aceptacion_terminos && (
              <p className="text-sm text-destructive mt-2">{errors.aceptacion_terminos.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting || loading} className="min-w-[150px]">
            {isSubmitting || loading ? 'Guardando...' : (club ? 'Actualizar Club' : 'Crear Club')}
          </Button>
        </div>
      </form>
    </div>
  );
};