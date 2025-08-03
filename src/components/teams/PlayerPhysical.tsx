import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Ruler, Weight, ArrowUp, TrendingUp } from 'lucide-react';
import { Player } from '@/hooks/usePlayers';

interface PlayerPhysicalProps {
  player: Player;
}

export const PlayerPhysical = ({ player }: PlayerPhysicalProps) => {
  const formatMeasurement = (value?: number, unit: string = '') => {
    return value ? `${value}${unit}` : 'No registrado';
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-yellow-600' };
    return { category: 'Obesidad', color: 'text-red-600' };
  };

  const bmi = calculateBMI(player.weight_kg, player.height_cm);
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Medidas Antropométricas
          </CardTitle>
          <CardDescription>
            Características físicas de la jugadora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full">
                <Ruler className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                Altura
              </h3>
              <p className="text-2xl font-bold">
                {formatMeasurement(player.height_cm, ' cm')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full">
                <Weight className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                Peso
              </h3>
              <p className="text-2xl font-bold">
                {formatMeasurement(player.weight_kg, ' kg')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full">
                <ArrowUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                Alcance
              </h3>
              <p className="text-2xl font-bold">
                {formatMeasurement(player.reach_cm, ' cm')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                Salto
              </h3>
              <p className="text-2xl font-bold">
                {formatMeasurement(player.jump_cm, ' cm')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {bmi && (
        <Card>
          <CardHeader>
            <CardTitle>Índice de Masa Corporal (IMC)</CardTitle>
            <CardDescription>
              Calculado en base a altura y peso registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{bmi}</p>
                <p className={`text-sm font-medium ${bmiInfo?.color}`}>
                  {bmiInfo?.category}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Altura: {player.height_cm} cm</p>
                <p>Peso: {player.weight_kg} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!player.height_cm && !player.weight_kg && !player.reach_cm && !player.jump_cm && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin datos físicos</h3>
            <p className="text-muted-foreground">
              No se han registrado medidas antropométricas para esta jugadora
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};