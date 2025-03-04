
import { LocalAIConfig } from "../llm/LocalAIConfig";
import { ImageConfig } from "../ImageConfig";
import { LLMProviderType } from "@/types/config";

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
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-semibold mb-4">Configuration de l'intelligence artificielle</h2>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
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
