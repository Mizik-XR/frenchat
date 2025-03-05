
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ModelNameFieldProps {
  modelId: string | undefined;
  onValueChange: (field: string, value: string) => void;
  isOpenSource?: boolean;
}

export function ModelNameField({ modelId, onValueChange, isOpenSource }: ModelNameFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
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
        
        {isOpenSource !== undefined && (
          <Badge className={isOpenSource ? 
            "bg-green-100 text-green-700 border-green-200" : 
            "bg-amber-100 text-amber-700 border-amber-200"
          }>
            {isOpenSource ? "Open Source" : "Propriétaire"}
          </Badge>
        )}
      </div>
      
      <Input 
        placeholder="gpt-4-turbo-preview"
        className="w-full font-mono text-base bg-white"
        onChange={(e) => onValueChange('modelName', e.target.value)}
        value={modelId || ''}
      />
    </div>
  );
}
