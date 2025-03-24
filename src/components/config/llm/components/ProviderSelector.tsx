
import { Button } from "@/components/ui/button";
import { LLMProviderType } from "@/types/config";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, ServerIcon, MoveUpRightIcon } from "lucide-react";
import { useState  } from '@/core/reactInstance';

interface ProviderSelectorProps {
  localProvider: LLMProviderType;
  onProviderChange: (provider: LLMProviderType) => void;
}

export function ProviderSelector({ localProvider, onProviderChange }: ProviderSelectorProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 justify-between">
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
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline"
        >
          {showDetails ? "Masquer les détails" : "Comparer les options"}
          <MoveUpRightIcon className="h-3 w-3" />
        </button>
      </div>
      
      {showDetails && (
        <div className="bg-gray-50 p-3 rounded-md mb-2 text-xs text-gray-700 border border-gray-200">
          <h4 className="font-medium mb-1.5">Complémentarité des fournisseurs locaux</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="font-medium flex items-center gap-1 text-blue-700">
                <ServerIcon className="h-3.5 w-3.5" />
                Python/Transformers
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Intégré directement dans FileChat</li>
                <li>Large bibliothèque de modèles</li>
                <li>Idéal pour l'analyse de texte</li>
                <li>Moins performant pour de longs dialogues</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <div className="font-medium flex items-center gap-1 text-green-700">
                <ServerIcon className="h-3.5 w-3.5" />
                Ollama
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Installation séparée requise</li>
                <li>Performances optimales</li>
                <li>Idéal pour les discussions longues</li>
                <li>Utilisation avancée de modèles locaux</li>
              </ul>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-gray-600">
            Les deux options peuvent être utilisées en complément selon vos besoins. FileChat bascule automatiquement vers l'option la plus adaptée si nécessaire.
          </p>
        </div>
      )}
      
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
