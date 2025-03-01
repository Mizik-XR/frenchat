
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, HardDrive, Check, HelpCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

interface LocationSelectorProps {
  selectedPath: string;
  onPathChange: (path: string) => void;
  onSelectLocation: (path: string) => void;
}

export function LocationSelector({ selectedPath, onPathChange, onSelectLocation }: LocationSelectorProps) {
  const [commonLocations] = useState([
    { name: "Documents", path: "C:\\Users\\[utilisateur]\\Documents\\IA Models" },
    { name: "Programme Files", path: "C:\\Program Files\\FileChat\\Models" },
    { name: "Disque local", path: "D:\\IA Models" },
  ]);

  const handleManualPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPathChange(e.target.value);
  };

  const handleBrowseClick = () => {
    // Simuler un dialogue de sélection de dossier
    // Dans une application réelle, nous utiliserions l'API File System ou Electron
    alert("Dans une application native, le sélecteur de fichiers s'ouvrirait ici.");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="font-medium">Emplacements recommandés</h3>
        <div className="grid gap-2">
          {commonLocations.map((location, index) => (
            <div 
              key={index}
              className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedPath === location.path ? "border-primary bg-primary/5" : "border-gray-200"
              }`}
              onClick={() => onSelectLocation(location.path)}
            >
              <HardDrive className="h-5 w-5 mr-3 text-gray-500" />
              <div className="flex-1">
                <p className="font-medium">{location.name}</p>
                <p className="text-sm text-gray-500">{location.path}</p>
              </div>
              {selectedPath === location.path && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          ))}
        </div>

        <div className="pt-2">
          <h3 className="font-medium mb-2">Chemin personnalisé</h3>
          <div className="flex gap-2">
            <Input
              value={selectedPath}
              onChange={handleManualPathChange}
              placeholder="C:\Models"
              className="flex-1"
            />
            <Button variant="outline" onClick={handleBrowseClick} className="gap-2">
              <Folder className="h-4 w-4" />
              Parcourir
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Assurez-vous d'avoir les droits d'écriture dans ce dossier.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-4">
        <h4 className="text-sm font-medium text-blue-700 flex items-center gap-1">
          <HelpCircle className="h-4 w-4" />
          Alternative recommandée
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Ollama est une solution plus simple qui gère automatiquement les modèles.
          Elle est recommandée pour la plupart des utilisateurs.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <a 
            href="https://ollama.ai/download" 
            target="_blank"
            rel="noopener noreferrer" 
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            Télécharger Ollama
            <ChevronRight className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
