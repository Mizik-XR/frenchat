
import { Download, ExternalLink, Folder, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface ModelPathSelectorProps {
  modelPath: string;
  defaultModelPath?: string;
  onPathChange: (path: string) => void;
  onPathSelect?: () => void;
  onDownloadCompanion?: () => void;
  onOpenWizard?: () => void;
  className?: string;
}

export function ModelPathSelector({ 
  modelPath, 
  defaultModelPath = "~/models", 
  onPathChange, 
  onPathSelect,
  onDownloadCompanion,
  onOpenWizard,
  className
}: ModelPathSelectorProps) {
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/version', { 
          signal: AbortSignal.timeout(2000) 
        });
        setIsOllamaAvailable(response.ok);
      } catch (e) {
        setIsOllamaAvailable(false);
      }
    };
    
    checkOllama();
  }, []);

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="space-y-4 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Label className="block text-sm font-medium text-gray-700 flex items-center">
            Chemin du modèle
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="bg-white p-2 z-50 shadow-lg border border-gray-200">
                  <p className="max-w-xs text-sm">
                    Les modèles d'IA seront téléchargés et installés dans ce dossier
                    lors de la première utilisation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={modelPath}
            onChange={(e) => onPathChange(e.target.value)}
            placeholder={defaultModelPath}
            className="flex-1 bg-white"
          />
          <Button
            variant="outline"
            onClick={onOpenWizard}
            className="gap-2 whitespace-nowrap"
          >
            <Folder className="h-4 w-4" />
            Parcourir
          </Button>
        </div>
        
        <div className="rounded-md bg-blue-50 p-3 border border-blue-100">
          <h4 className="text-sm font-medium text-blue-800">Solution recommandée: Ollama</h4>
          <p className="text-sm text-gray-600 mt-1">
            Pour une expérience plus simple, nous recommandons d'utiliser Ollama, 
            qui ne nécessite pas de configurer un chemin et fonctionne automatiquement.
          </p>
          <div className="flex mt-2">
            <a 
              href="https://ollama.ai/download" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Télécharger Ollama
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
