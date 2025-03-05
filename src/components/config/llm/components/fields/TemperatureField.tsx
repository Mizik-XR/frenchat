
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TemperatureFieldProps {
  temperature: number | undefined;
  onValueChange: (field: string, value: number) => void;
}

export function TemperatureField({ temperature, onValueChange }: TemperatureFieldProps) {
  // Fonction pour déterminer le style et le texte selon la température
  const getTemperatureInfo = (temp: number) => {
    if (temp < 0.3) {
      return { style: "text-blue-600", text: "Précis" };
    } else if (temp < 0.7) {
      return { style: "text-green-600", text: "Équilibré" };
    } else {
      return { style: "text-amber-600", text: "Créatif" };
    }
  };
  
  const tempValue = temperature || 0.7;
  const tempInfo = getTemperatureInfo(tempValue);

  return (
    <div className="space-y-4">
      <Label className="text-gray-700 flex items-center gap-2">
        Température
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Contrôle la créativité du modèle (0 = précis, 1 = créatif)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <div className="flex items-center gap-4">
        <Slider
          defaultValue={[tempValue]}
          max={1}
          step={0.1}
          className="flex-1"
          onValueChange={([value]) => onValueChange('temperature', value)}
        />
        <div className="flex flex-col items-end min-w-[80px]">
          <span className="text-sm text-gray-600">
            {tempValue.toFixed(1)}
          </span>
          <span className={`text-xs ${tempInfo.style} font-medium`}>
            {tempInfo.text}
          </span>
        </div>
      </div>
    </div>
  );
}
