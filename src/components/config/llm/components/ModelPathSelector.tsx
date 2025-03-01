
import { Download, ExternalLink, Folder, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { ModelPathWizard } from "./ModelPathWizard";

interface ModelPathSelectorProps {
  modelPath: string;
  defaultModelPath: string;
  onPathChange: (path: string) => void;
  onPathSelect: () => void;
  onDownloadCompanion?: () => void;
}

export function ModelPathSelector({ 
  modelPath, 
  defaultModelPath, 
  onPathChange, 
  onPathSelect,
  onDownloadCompanion
}: ModelPathSelectorProps) {
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  // Vérifier si Ollama est disponible
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

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handlePathSelected = (path: string) => {
    onPathChange(path);
  };

  return (
    <div className="space-y-6">
      {isOllamaAvailable === true && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-800 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Ollama détecté!
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Ollama est installé et fonctionne sur votre machine. C'est la méthode recommandée pour utiliser l'IA locale.
          </p>
          <Button
            variant="outline" 
            size="sm"
            className="mt-2"
            onClick={() => {
              localStorage.setItem('localProvider', 'ollama');
              localStorage.setItem('localAIUrl', 'http://localhost:11434');
              localStorage.setItem('aiServiceType', 'local');
              alert("Configuration avec Ollama terminée! L'application utilisera maintenant Ollama pour l'IA locale.");
            }}
          >
            Configurer automatiquement
          </Button>
        </div>
      )}
    
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <Label className="block text-sm font-medium text-gray-700 flex items-center">
            Dossier d'installation des modèles
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Les modèles d'IA seront téléchargés et installés dans ce dossier
                    lors de la première utilisation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1"
            onClick={onDownloadCompanion}
          >
            <Download className="h-3.5 w-3.5" />
            Télécharger IA Locale
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={modelPath}
            onChange={(e) => onPathChange(e.target.value)}
            placeholder={defaultModelPath}
            className="flex-1 bg-white"
          />
          <Button
            variant="default"
            onClick={handleOpenWizard}
            className="gap-2"
          >
            <Folder className="h-4 w-4" />
            Assistant d'installation
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

      <ModelPathWizard 
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        onPathSelected={handlePathSelected}
        defaultPath={modelPath || defaultModelPath}
      />
    </div>
  );
}
