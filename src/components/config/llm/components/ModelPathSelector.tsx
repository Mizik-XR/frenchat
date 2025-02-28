
import { Download, ExternalLink, Folder, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          Dossier d'installation des modèles
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
        </label>
        
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={onDownloadCompanion}
        >
          <Download className="h-3.5 w-3.5" />
          Télécharger Compagnon
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
          variant="outline"
          onClick={onPathSelect}
          className="gap-2"
        >
          <Folder className="h-4 w-4" />
          Parcourir
        </Button>
      </div>
      
      <div className="rounded-md bg-blue-50 p-3 border border-blue-100">
        <h4 className="text-sm font-medium text-blue-800">Compagnon Microsoft</h4>
        <p className="text-sm text-gray-600 mt-1">
          Pour de meilleures performances, vous pouvez installer le Compagnon Microsoft,
          qui vous permet d'exécuter des modèles d'IA plus puissants en local.
        </p>
        <div className="flex mt-2">
          <a 
            href="https://aka.ms/ollama-windows" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            Documentation Ollama
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
