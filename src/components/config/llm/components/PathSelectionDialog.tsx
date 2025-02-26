
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurer le dossier d'installation</DialogTitle>
          <DialogDescription>
            Sélectionnez où vous souhaitez installer les modèles locaux
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Chemin d'installation
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
