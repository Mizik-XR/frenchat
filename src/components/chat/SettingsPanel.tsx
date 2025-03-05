
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
import { Switch } from "@/components/ui/switch";
import { ZapIcon, CloudIcon, ServerIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  onModelSourceChange: (source: 'cloud' | 'local') => void;
  onModeChange?: (mode: "auto" | "manual") => void;
}

export const SettingsPanel = ({
  webUIConfig,
  onWebUIConfigChange,
  onProviderChange,
  onAnalysisModeChange,
  modelSource,
  onModelSourceChange,
  onModeChange
}: SettingsPanelProps) => {
  const [availableModels, setAvailableModels] = useState(CLOUD_MODELS);
  const [autoMode, setAutoMode] = useState(localStorage.getItem('aiServiceType') === 'hybrid');

  // Update available models when modelSource changes
  useEffect(() => {
    setAvailableModels(modelSource === 'cloud' ? CLOUD_MODELS : LOCAL_MODELS);
  }, [modelSource]);

  const handleModelAdd = (model: any) => {
    // Add custom model logic here
    console.log("Adding custom model:", model);
  };

  const handleAutoModeChange = (isEnabled: boolean) => {
    setAutoMode(isEnabled);
    
    // Save to localStorage
    localStorage.setItem('aiServiceType', isEnabled ? 'hybrid' : modelSource);
    
    // Notify parent
    if (onModeChange) {
      onModeChange(isEnabled ? "auto" : "manual");
    }
  };

  return (
    <Card className="p-4 space-y-6 shadow-lg">
      <div className="space-y-2 border-b pb-4">
        <div className="flex items-center justify-between">
          <Label className="font-medium flex items-center gap-2">
            <ZapIcon className="h-4 w-4 text-yellow-500" />
            Mode automatique
          </Label>
          <Switch
            checked={autoMode}
            onCheckedChange={handleAutoModeChange}
          />
        </div>
        <p className="text-xs text-gray-500">
          {autoMode 
            ? "L'IA alterne automatiquement entre modèles locaux et cloud selon vos requêtes" 
            : "Vous utilisez uniquement le mode que vous avez sélectionné"}
        </p>
      </div>

      {!autoMode && (
        <div className="space-y-2">
          <Label>Source des modèles</Label>
          <RadioGroup 
            defaultValue={modelSource} 
            onValueChange={(v) => onModelSourceChange(v as 'cloud' | 'local')}
            className="flex gap-4 pb-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="local" id="model-local" />
              <Label htmlFor="model-local" className="flex items-center cursor-pointer">
                <ServerIcon className="h-4 w-4 mr-1 text-purple-600" />
                <span>Local</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cloud" id="model-cloud" />
              <Label htmlFor="model-cloud" className="flex items-center cursor-pointer">
                <CloudIcon className="h-4 w-4 mr-1 text-blue-600" />
                <span>Cloud</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-2">
        <Label>Modèle {autoMode ? "" : (modelSource === 'cloud' ? '(Cloud)' : '(Local)')}</Label>
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
