
import { useState } from "react";
import { GoogleConfig } from "@/types/config";
import { useGoogleDriveConfig } from "@/hooks/useGoogleDriveConfig";
import { GoogleDriveWizard } from "./GoogleDriveWizard";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export const GoogleDriveConfig = () => {
  const { config, isLoading, saveConfig } = useGoogleDriveConfig();
  const [showWizard, setShowWizard] = useState(!config.clientId || !config.apiKey);

  const handleConfigSave = async (newConfig: GoogleConfig) => {
    await saveConfig(newConfig);
    setShowWizard(false);
    toast({
      title: "Configuration réussie !",
      description: "Vos identifiants Google Drive ont été enregistrés avec succès.",
      duration: 5000,
    });
  };

  const handleSkip = () => {
    setShowWizard(false);
    toast({
      title: "Configuration reportée",
      description: "Vous pourrez configurer Google Drive plus tard depuis les paramètres.",
      duration: 5000,
    });
  };

  if (isLoading) {
    return null;
  }

  if (!showWizard && config.clientId && config.apiKey) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>Google Drive configuré</AlertTitle>
        <AlertDescription>
          Votre compte Google Drive est correctement configuré et prêt à être utilisé.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <GoogleDriveWizard
      onConfigSave={handleConfigSave}
      onSkip={handleSkip}
    />
  );
};
