
import { Button } from "@/components/ui/button";
import { LLMProviderType } from "@/types/config";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface ProviderSelectorProps {
  localProvider: LLMProviderType;
  onProviderChange: (provider: LLMProviderType) => void;
}

export function ProviderSelector({ localProvider, onProviderChange }: ProviderSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Fournisseur local
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-3.5 w-3.5 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-2 p-1">
                <p className="text-xs">
                  <span className="font-semibold">Hugging Face :</span> Intégré directement dans l'application, fonctionne immédiatement sans installation supplémentaire.
                </p>
                <p className="text-xs">
                  <span className="font-semibold">Ollama :</span> Logiciel externe offrant plus de modèles et de meilleures performances, nécessite une installation séparée.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex gap-2 pb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={localProvider === "huggingface" ? "default" : "outline"}
                onClick={() => onProviderChange("huggingface")}
                className="flex-1"
              >
                Hugging Face (intégré)
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">Fonctionne immédiatement sans installation supplémentaire, idéal pour les débutants</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={localProvider === "ollama" ? "default" : "outline"}
                onClick={() => onProviderChange("ollama")}
                className="flex-1"
              >
                Ollama (Windows/Mac/Linux)
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">Offre une large gamme de modèles performants, mais nécessite une installation séparée</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
