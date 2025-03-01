
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LLMProviderType } from "@/types/config";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { PathSelectionDialog } from "./components/PathSelectionDialog";
import { CompanionDownloadDialog } from "./components/CompanionDownloadDialog";
import { ServiceStatusAlert } from "./components/ServiceStatusAlert";
import { ProviderSelector } from "./components/ProviderSelector";
import { ConfigurationTabs } from "./components/ConfigurationTabs";
import { ModelPathWizard } from "./components/wizard/ModelPathWizard";

export interface LocalAIConfigProps {
  modelPath?: string;
  onModelPathChange?: (path: string) => void;
  provider?: LLMProviderType;
  onProviderChange?: (provider: LLMProviderType) => void;
  onSave?: () => void;
}

export function LocalAIConfig({
  modelPath = "",
  onModelPathChange = () => {},
  provider = "huggingface",
  onProviderChange = () => {},
  onSave
}: LocalAIConfigProps) {
  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false);
  const [wizardDialogOpen, setWizardDialogOpen] = useState(false);
  const defaultModelPath = `${process.env.APPDATA || process.env.HOME}/filechat/models`;
  const [localModelPath, setLocalModelPath] = useState(modelPath || defaultModelPath);
  const [localProvider, setLocalProvider] = useState<LLMProviderType>(provider);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);
  const { checkLocalService, setLocalProviderConfig, localAIUrl } = useHuggingFace();
  
  // Default model for companion download
  const [selectedModelId, setSelectedModelId] = useState<string>("TheBloke/Mistral-7B-Instruct-v0.2-GGUF");
  const [selectedModelName, setSelectedModelName] = useState<string>("Mistral 7B Instruct");

  useEffect(() => {
    // Vérifier si le service local est disponible au chargement
    const checkService = async () => {
      const isAvailable = await checkLocalService();
      setServiceAvailable(isAvailable);
    };
    
    checkService();

    // Vérifier le service toutes les 30 secondes
    const interval = setInterval(checkService, 30000);
    return () => clearInterval(interval);
  }, [checkLocalService]);

  const handleLocalPathChange = (path: string) => {
    setLocalModelPath(path);
    onModelPathChange(path);
  };

  const handleLocalProviderChange = (newProvider: LLMProviderType) => {
    setLocalProvider(newProvider);
    onProviderChange(newProvider);
    setLocalProviderConfig(newProvider);
    
    toast({
      title: `Fournisseur local changé pour ${newProvider}`,
      description: "L'IA utilisera ce fournisseur pour les modèles locaux"
    });
  };

  const handlePathConfirm = () => {
    setPathDialogOpen(false);
    toast({
      title: "Chemin d'installation mis à jour",
      description: "Les modèles seront installés dans ce dossier"
    });
    
    if (onSave) {
      onSave();
    }
  };

  const handleDownloadCompanion = () => {
    setCompanionDialogOpen(true);
  };

  const handleOpenWizard = () => {
    setWizardDialogOpen(true);
  };

  const handleCloseWizard = () => {
    setWizardDialogOpen(false);
  };

  const handleWizardPathSelected = (path: string) => {
    handleLocalPathChange(path);
    if (onSave) {
      onSave();
    }
    toast({
      title: "Chemin d'installation mis à jour",
      description: "Les modèles seront installés dans ce dossier"
    });
  };

  const handleDownloadSuccess = () => {
    toast({
      title: "Téléchargement terminé",
      description: "Le modèle a été téléchargé avec succès et est prêt à être utilisé"
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
            <ServiceStatusAlert serviceAvailable={serviceAvailable} />

            <ProviderSelector 
              localProvider={localProvider}
              onProviderChange={handleLocalProviderChange}
            />

            <ConfigurationTabs
              localModelPath={localModelPath}
              defaultModelPath={defaultModelPath}
              onPathChange={handleLocalPathChange}
              onPathSelect={() => setPathDialogOpen(true)}
              onDownloadCompanion={handleDownloadCompanion}
              onOpenWizard={handleOpenWizard}
              localAIUrl={localAIUrl}
            />
          </div>
          
          {onSave && (
            <div className="flex justify-end mt-4">
              <Button onClick={onSave}>
                Enregistrer la configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PathSelectionDialog
        open={pathDialogOpen}
        onOpenChange={setPathDialogOpen}
        modelPath={localModelPath}
        defaultModelPath={defaultModelPath}
        onPathChange={handleLocalPathChange}
        onConfirm={handlePathConfirm}
      />

      <CompanionDownloadDialog
        open={companionDialogOpen}
        onOpenChange={setCompanionDialogOpen}
        modelId={selectedModelId}
        modelName={selectedModelName}
        onSuccess={handleDownloadSuccess}
      />

      <ModelPathWizard 
        isOpen={wizardDialogOpen}
        onClose={handleCloseWizard}
        onPathSelected={handleWizardPathSelected}
        defaultPath={localModelPath || defaultModelPath}
      />
    </div>
  );
}
