
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ModelNameFieldProps {
  modelId: string | undefined;
  onValueChange: (field: string, value: string) => void;
}

export function ModelNameField({ modelId, onValueChange }: ModelNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700 flex items-center gap-2">
        Nom du modèle
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Le modèle spécifique à utiliser (ex: gpt-4-turbo-preview)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <Input 
        placeholder="gpt-4-turbo-preview"
        className="w-full font-mono text-base bg-white"
        onChange={(e) => onValueChange('modelName', e.target.value)}
        value={modelId || ''}
      />
    </div>
  );
}
