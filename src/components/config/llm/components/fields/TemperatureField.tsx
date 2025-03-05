
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TemperatureFieldProps {
  temperature: number | undefined;
  onValueChange: (field: string, value: number) => void;
}

export function TemperatureField({ temperature, onValueChange }: TemperatureFieldProps) {
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
          defaultValue={[temperature || 0.7]}
          max={1}
          step={0.1}
          className="flex-1"
          onValueChange={([value]) => onValueChange('temperature', value)}
        />
        <span className="text-sm text-gray-600 min-w-[40px]">
          {temperature?.toFixed(1) || "0.7"}
        </span>
      </div>
    </div>
  );
}
