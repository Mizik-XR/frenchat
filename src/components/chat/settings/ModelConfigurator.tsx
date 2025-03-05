
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AIProvider, WebUIConfig, AnalysisMode } from "@/types/chat";
import { ModelSelector } from "../../config/llm/ModelSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define available models based on source (moved from SettingsPanel)
export const CLOUD_MODELS = [
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Modèle par défaut via l'API Hugging Face",
    requiresKey: false
  },
  {
    id: "internet-search",
    name: "Recherche Internet",
    description: "Recherche d'informations sur le web",
    requiresKey: false
  },
  {
    id: "deepseek",
    name: "DeepThink",
    description: "Analyse avancée par Hugging Face Deep Search",
    requiresKey: true
  }
];

export const LOCAL_MODELS = [
  {
    id: "mistral",
    name: "Mistral 7B",
    description: "Modèle local optimisé pour votre machine",
    requiresKey: false
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Utilise les modèles configurés dans Ollama",
    requiresKey: false
  }
];

interface ModelConfiguratorProps {
  webUIConfig: WebUIConfig;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  modelSource: 'cloud' | 'local';
  isAutoMode: boolean;
}

export const ModelConfigurator = ({
  webUIConfig,
  onWebUIConfigChange,
  onProviderChange,
  onAnalysisModeChange,
  modelSource,
  isAutoMode
}: ModelConfiguratorProps) => {
  const availableModels = modelSource === 'cloud' ? CLOUD_MODELS : LOCAL_MODELS;
  
  const handleModelAdd = (model: any) => {
    // Add custom model logic here
    console.log("Adding custom model:", model);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Modèle {isAutoMode ? "" : (modelSource === 'cloud' ? '(Cloud)' : '(Local)')}</Label>
        <ModelSelector
          models={availableModels}
          selectedModel={webUIConfig.model}
          onModelSelect={(modelId) => onProviderChange(modelId as AIProvider)}
          onModelAdd={handleModelAdd}
          label="Sélectionner un modèle"
          type={modelSource === 'cloud' ? "cloud" : "local"}
        />
      </div>

      <div className="space-y-2">
        <Label>Mode d'analyse</Label>
        <Select
          value={webUIConfig.analysisMode}
          onValueChange={(value) => onAnalysisModeChange(value as AnalysisMode)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Normal</SelectItem>
            <SelectItem value="analysis">Analyse détaillée</SelectItem>
            <SelectItem value="summary">Résumé</SelectItem>
            <SelectItem value="action">Actions concrètes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Température ({webUIConfig.temperature})</Label>
        <Slider
          value={[webUIConfig.temperature]}
          onValueChange={([value]) =>
            onWebUIConfigChange({ temperature: value })
          }
          max={1}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label>Nombre maximum de tokens ({webUIConfig.maxTokens})</Label>
        <Slider
          value={[webUIConfig.maxTokens]}
          onValueChange={([value]) =>
            onWebUIConfigChange({ maxTokens: value })
          }
          max={4000}
          step={100}
        />
      </div>
    </div>
  );
};
