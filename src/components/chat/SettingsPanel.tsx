
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AIProvider, WebUIConfig, AnalysisMode } from "@/types/chat";
import { ModelSelector } from "../config/llm/ModelSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

// Define available models based on source
const CLOUD_MODELS = [
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

const LOCAL_MODELS = [
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

interface SettingsPanelProps {
  webUIConfig: WebUIConfig;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  modelSource: 'cloud' | 'local';
}

export const SettingsPanel = ({
  webUIConfig,
  onWebUIConfigChange,
  onProviderChange,
  onAnalysisModeChange,
  modelSource
}: SettingsPanelProps) => {
  const [availableModels, setAvailableModels] = useState(CLOUD_MODELS);

  // Update available models when modelSource changes
  useEffect(() => {
    setAvailableModels(modelSource === 'cloud' ? CLOUD_MODELS : LOCAL_MODELS);
  }, [modelSource]);

  const handleModelAdd = (model: any) => {
    // Add custom model logic here
    console.log("Adding custom model:", model);
  };

  return (
    <Card className="p-4 space-y-6 shadow-lg">
      <div className="space-y-2">
        <Label>Modèle ({modelSource === 'cloud' ? 'Cloud' : 'Local'})</Label>
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
    </Card>
  );
};
