
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ServerIcon, CloudIcon, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ModelSourceSelectorProps {
  modelSource: 'cloud' | 'local';
  onModelSourceChange: (source: 'cloud' | 'local') => void;
}

export const ModelSourceSelector = ({ 
  modelSource, 
  onModelSourceChange 
}: ModelSourceSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        Source des modèles
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-3.5 w-3.5 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">Choisissez où l'IA sera exécutée : sur votre ordinateur (local) ou sur des serveurs distants (cloud)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <RadioGroup 
        defaultValue={modelSource} 
        onValueChange={(v) => onModelSourceChange(v as 'cloud' | 'local')}
        className="flex gap-6 pb-1"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="local" id="model-local" />
                <Label htmlFor="model-local" className="flex items-center cursor-pointer">
                  <ServerIcon className="h-4 w-4 mr-1 text-green-600" />
                  <span>Local</span>
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1 max-w-xs">
                <p className="font-medium text-sm">Mode Local</p>
                <p className="text-xs">Confidentialité totale, fonctionne même hors-ligne. Vos données restent sur votre ordinateur.</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cloud" id="model-cloud" />
                <Label htmlFor="model-cloud" className="flex items-center cursor-pointer">
                  <CloudIcon className="h-4 w-4 mr-1 text-blue-600" />
                  <span>Cloud</span>
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1 max-w-xs">
                <p className="font-medium text-sm">Mode Cloud</p>
                <p className="text-xs">Puissance maximale, idéal pour les tâches complexes et l'analyse approfondie de documents.</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </RadioGroup>
    </div>
  );
};
