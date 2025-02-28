
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExternalLink, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PathSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelPath: string;
  defaultModelPath: string;
  onPathChange: (path: string) => void;
  onConfirm: () => void;
}

export function PathSelectionDialog({
  open,
  onOpenChange,
  modelPath,
  defaultModelPath,
  onPathChange,
  onConfirm,
}: PathSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurer le dossier d'installation</DialogTitle>
          <DialogDescription>
            Sélectionnez où vous souhaitez installer les modèles d'IA locaux
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              Chemin d'installation
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Ce dossier contiendra les modèles d'IA téléchargés. 
                      Assurez-vous d'avoir au moins 2Go d'espace libre.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              value={modelPath}
              onChange={(e) => onPathChange(e.target.value)}
              placeholder={defaultModelPath}
            />
            <p className="text-sm text-gray-500">
              Chemin par défaut recommandé : {defaultModelPath}
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Installation locale</h4>
            <p className="text-sm text-blue-700">
              L'IA locale sera téléchargée automatiquement lors de la première utilisation.
              Aucune donnée ne quittera votre ordinateur.
            </p>
            <a 
              href="https://huggingface.co/docs/transformers.js/index" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
            >
              En savoir plus sur les modèles locaux
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onConfirm}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
