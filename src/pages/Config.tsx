import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfigHeader } from "@/components/config/ConfigHeader";
import { ConfigIntro } from "@/components/config/ConfigIntro";
import { GoogleDriveConfig } from "@/components/config/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";
import { LLMConfigComponent } from "@/components/config/LLMConfig";
import { ImageConfig } from "@/components/config/ImageConfig";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { GoogleConfig, TeamsConfig, LLMConfig } from "@/types/config";
import { useAuth } from "@/components/AuthProvider";

const defaultGoogleConfig: GoogleConfig = {
  clientId: "",
  apiKey: "",
};

const defaultTeamsConfig: TeamsConfig = {
  clientId: "",
  tenantId: "",
};

const defaultLLMConfig: LLMConfig = {
  provider: "openai",
  model: "",
  apiKey: "",
  batchSize: 10,
  cacheEnabled: true,
  useLocal: false,
};

export function Config() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [googleConfig, setGoogleConfig] = useState<GoogleConfig>(defaultGoogleConfig);
  const [teamsConfig, setTeamsConfig] = useState<TeamsConfig>(defaultTeamsConfig);
  const [llmConfig, setLLMConfig] = useState<LLMConfig>(defaultLLMConfig);
  const [stableDiffusionModel, setStableDiffusionModel] = useState("sd-v1.5");

  const handleBack = () => {
    navigate(-1);
  };

  const handleSaveGoogle = async () => {
    toast({
      title: "Configuration Google Drive sauvegardée",
      description: "Vos paramètres Google Drive ont été mis à jour avec succès.",
    });
  };

  const handleSaveTeams = async () => {
    toast({
      title: "Configuration Microsoft Teams sauvegardée",
      description: "Vos paramètres Microsoft Teams ont été mis à jour avec succès.",
    });
  };

  const handleSaveLLM = async () => {
    toast({
      title: "Configuration LLM sauvegardée",
      description: "Vos paramètres du modèle de langage ont été mis à jour avec succès.",
    });
  };

  const handleSkipConfig = () => {
    toast({
      title: "Configuration reportée",
      description: "Vous pourrez configurer vos services plus tard depuis les paramètres.",
    });
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <ConfigHeader onBack={handleBack} />
        <ConfigIntro />
        
        <div className="space-y-8">
          <GoogleDriveConfig
            config={googleConfig}
            onConfigChange={setGoogleConfig}
            onSave={handleSaveGoogle}
          />

          <MicrosoftTeamsConfig
            config={teamsConfig}
            onConfigChange={setTeamsConfig}
            onSave={handleSaveTeams}
          />

          <LLMConfigComponent
            config={llmConfig}
            onConfigChange={setLLMConfig}
            onSave={handleSaveLLM}
          />

          <ImageConfig
            model={stableDiffusionModel}
            onModelChange={setStableDiffusionModel}
          />

          <div className="flex justify-end space-x-4 mt-8">
            <Button variant="outline" onClick={handleSkipConfig}>
              Configurer plus tard
            </Button>
            <Button onClick={() => navigate("/chat")}>
              Terminer la configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
