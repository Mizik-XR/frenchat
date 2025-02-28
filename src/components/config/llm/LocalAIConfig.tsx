
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModelPathSelector } from "./components/ModelPathSelector";
import { PathSelectionDialog } from "./components/PathSelectionDialog";
import { CompanionDownloadDialog } from "./components/CompanionDownloadDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LLMProviderType } from "@/types/config";

interface LocalAIConfigProps {
  modelPath: string;
  onModelPathChange: (path: string) => void;
  provider: LLMProviderType;
  onProviderChange: (provider: LLMProviderType) => void;
}

export function LocalAIConfig({
  modelPath,
  onModelPathChange,
  provider,
  onProviderChange
}: LocalAIConfigProps) {
  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false);
  const defaultModelPath = `${process.env.APPDATA || process.env.HOME}/filechat/models`;

  const handlePathConfirm = () => {
    setPathDialogOpen(false);
    toast({
      title: "Chemin d'installation mis à jour",
      description: "Les modèles seront installés dans ce dossier"
    });
  };

  const handleDownloadCompanion = () => {
    setCompanionDialogOpen(true);
  };

  const handleProviderChange = (newProvider: LLMProviderType) => {
    onProviderChange(newProvider);
    toast({
      title: `Fournisseur local changé pour ${newProvider}`,
      description: "L'IA utilisera ce fournisseur pour les modèles locaux"
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'IA locale</CardTitle>
          <CardDescription>
            Utilisez des modèles d'IA en local pour plus de confidentialité et de rapidité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Fournisseur local
              </label>
              <div className="flex gap-2 pb-2">
                <Button
                  variant={provider === "huggingface" ? "default" : "outline"}
                  onClick={() => handleProviderChange("huggingface")}
                  className="flex-1"
                >
                  Hugging Face (intégré)
                </Button>
                <Button
                  variant={provider === "ollama" ? "default" : "outline"}
                  onClick={() => handleProviderChange("ollama")}
                  className="flex-1"
                >
                  Ollama (Windows/Mac/Linux)
                </Button>
              </div>
            </div>

            <ModelPathSelector
              modelPath={modelPath}
              defaultModelPath={defaultModelPath}
              onPathChange={onModelPathChange}
              onPathSelect={() => setPathDialogOpen(true)}
              onDownloadCompanion={handleDownloadCompanion}
            />
          </div>
        </CardContent>
      </Card>

      <PathSelectionDialog
        open={pathDialogOpen}
        onOpenChange={setPathDialogOpen}
        modelPath={modelPath}
        defaultModelPath={defaultModelPath}
        onPathChange={onModelPathChange}
        onConfirm={handlePathConfirm}
      />

      <CompanionDownloadDialog
        open={companionDialogOpen}
        onOpenChange={setCompanionDialogOpen}
      />
    </div>
  );
}
