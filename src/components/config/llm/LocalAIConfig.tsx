
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LLMProviderType } from "@/types/config";
import { ModelPathSelector } from "./components/ModelPathSelector";
import { ModelPathWizard } from "./components/wizard/ModelPathWizard";
import { LOCAL_MODELS, CLOUD_MODELS } from "./types";
import { ModelSelector } from "./ModelSelector";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudIcon, ServerIcon } from "lucide-react";

interface LocalAIConfigProps {
  modelPath: string;
  provider: LLMProviderType;
  onProviderChange: (provider: LLMProviderType) => void;
  onModelPathChange: (path: string) => void;
  onSave: () => void;
  defaultMode?: "local" | "cloud";
}

export const LocalAIConfig = ({
  modelPath,
  provider,
  onProviderChange,
  onModelPathChange,
  onSave,
  defaultMode = "local"
}: LocalAIConfigProps) => {
  const [mode, setMode] = useState<"local" | "cloud">(defaultMode);
  const [localSelectedModel, setLocalSelectedModel] = useState<string>("mistral-local");
  const [cloudSelectedModel, setCloudSelectedModel] = useState<string>("huggingface/mixtral");
  const [showPathWizard, setShowPathWizard] = useState(false);

  // Synchroniser le provider avec les sélections de modèle
  useEffect(() => {
    if (mode === "local") {
      // Extraire le provider à partir de l'ID du modèle local
      const modelId = localSelectedModel;
      let newProvider: LLMProviderType = "mistral"; // Par défaut
      
      if (modelId.includes("mistral")) {
        newProvider = "mistral";
      } else if (modelId.includes("deepseek")) {
        newProvider = "deepseek";
      } else if (modelId.includes("qwen")) {
        newProvider = "qwen";
      } else if (modelId.includes("ollama")) {
        newProvider = "ollama";
      } else {
        newProvider = "local";
      }
      
      if (newProvider !== provider) {
        onProviderChange(newProvider);
      }
    } else {
      // Mode cloud
      const modelId = cloudSelectedModel;
      let newProvider: LLMProviderType = "huggingface"; // Par défaut
      
      if (modelId.includes("openai")) {
        newProvider = "openai";
      } else if (modelId.includes("anthropic")) {
        newProvider = "anthropic";
      } else if (modelId.includes("perplexity")) {
        newProvider = "perplexity";
      } else {
        newProvider = "huggingface";
      }
      
      if (newProvider !== provider) {
        onProviderChange(newProvider);
      }
    }
  }, [mode, localSelectedModel, cloudSelectedModel]);

  const handleSave = () => {
    onSave();
  };

  const handleModeChange = (newMode: "local" | "cloud") => {
    setMode(newMode);
  };

  const handleLocalModelSelect = (modelId: string) => {
    setLocalSelectedModel(modelId);
  };

  const handleCloudModelSelect = (modelId: string) => {
    setCloudSelectedModel(modelId);
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={mode} 
        value={mode}
        onValueChange={(value) => handleModeChange(value as "local" | "cloud")}
        className="w-full mb-4"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="local" className="flex items-center gap-2">
            <ServerIcon className="h-4 w-4" />
            Local
          </TabsTrigger>
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <CloudIcon className="h-4 w-4" />
            Cloud
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {mode === "local" ? (
          <>
            <div className="space-y-4">
              <ModelSelector
                models={LOCAL_MODELS}
                selectedModel={localSelectedModel}
                onModelSelect={handleLocalModelSelect}
                onModelAdd={(model) => {}}
                label="Sélectionner un modèle local"
                type="local"
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Chemin du modèle local
                </label>
                <div className="flex gap-2">
                  <ModelPathSelector
                    modelPath={modelPath}
                    onPathChange={onModelPathChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPathWizard(true)}
                  >
                    Assistant
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ModelSelector
            models={CLOUD_MODELS}
            selectedModel={cloudSelectedModel}
            onModelSelect={handleCloudModelSelect}
            onModelAdd={(model) => {}}
            label="Sélectionner un service cloud"
            type="cloud"
          />
        )}

        <Button
          type="button"
          onClick={handleSave}
          className="w-full"
        >
          Enregistrer la configuration
        </Button>
      </div>

      {showPathWizard && (
        <ModelPathWizard
          isOpen={showPathWizard}
          onClose={() => setShowPathWizard(false)}
          onPathSelected={onModelPathChange}
          defaultPath={modelPath}
        />
      )}
    </div>
  );
};
