
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ModelPathSelectorProps {
  modelPath: string;
  defaultModelPath: string;
  onPathChange: (path: string) => void;
  onPathSelect: () => void;
}

export function ModelPathSelector({ 
  modelPath, 
  defaultModelPath, 
  onPathChange, 
  onPathSelect 
}: ModelPathSelectorProps) {
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700">
        Dossier d'installation des modèles
      </label>
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
      <p className="text-sm text-gray-500">
        Les modèles seront téléchargés et installés dans ce dossier
      </p>
    </div>
  );
}
