
import { LocalAIConfig } from "../llm/LocalAIConfig";
import { ImageConfig } from "../ImageConfig";
import { LLMProviderType } from "@/types/config";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudIcon, ServerIcon } from "lucide-react";
import { useState } from "react";

interface IntelligenceStepProps {
  modelPath: string;
  onModelPathChange: (path: string) => void;
  provider: LLMProviderType;
  onProviderChange: (provider: LLMProviderType) => void;
  onLLMSave: () => void;
  onImageConfigSave: () => void;
}

export const IntelligenceStep = ({
  modelPath,
  onModelPathChange,
  provider,
  onProviderChange,
  onLLMSave,
  onImageConfigSave
}: IntelligenceStepProps) => {
  const [aiMode, setAIMode] = useState<"local" | "cloud">("local");

  const handleModeChange = (mode: "local" | "cloud") => {
    setAIMode(mode);
    // Ajustement du provider par défaut en fonction du mode
    if (mode === "local" && !["mistral", "local", "ollama"].includes(provider)) {
      onProviderChange("mistral");
    } else if (mode === "cloud" && ["mistral", "local", "ollama"].includes(provider)) {
      onProviderChange("huggingface");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-semibold mb-4">Configuration de l'intelligence artificielle</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Mode de fonctionnement</h3>
        <Tabs 
          defaultValue="local" 
          value={aiMode} 
          onValueChange={(value) => handleModeChange(value as "local" | "cloud")}
          className="w-full"
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
        <p className="text-sm text-gray-600 mt-2">
          {aiMode === "local" 
            ? "Mode local : utilise les ressources de votre ordinateur, sans envoi de données externes." 
            : "Mode cloud : utilise des API en ligne pour de meilleures performances (nécessite une connexion internet)."}
        </p>
      </div>
      
      <div className={`bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6 ${aiMode === "local" ? "ring-2 ring-purple-200" : ""}`}>
        <h3 className="text-lg font-medium mb-2">Modèle de langage</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configurez le modèle de langage qui sera utilisé pour comprendre et répondre à vos questions.
        </p>
        <LocalAIConfig 
          modelPath={modelPath}
          onModelPathChange={onModelPathChange}
          provider={provider}
          onProviderChange={onProviderChange}
          onSave={onLLMSave}
          defaultMode={aiMode}
        />
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h3 className="text-lg font-medium mb-2">Génération d'images</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configurez les paramètres de génération d'images (optionnel).
        </p>
        <ImageConfig
          onSave={onImageConfigSave}
        />
      </div>
    </div>
  );
};
