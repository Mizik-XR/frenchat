
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AIProvider, WebUIConfig } from "@/types/chat";
import { ModelSelector } from "../config/llm/ModelSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface SettingsPanelProps {
  webUIConfig: WebUIConfig;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
}

export const SettingsPanel = ({
  webUIConfig,
  onWebUIConfigChange,
  onProviderChange,
}: SettingsPanelProps) => {
  return (
    <Card className="p-4 space-y-6 shadow-lg">
      <div className="space-y-2">
        <Label>Modèle</Label>
        <Select
          value={webUIConfig.model}
          onValueChange={(value) => onProviderChange(value as AIProvider)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un modèle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="huggingface">Hugging Face</SelectItem>
            <SelectItem value="internet-search">Recherche Internet</SelectItem>
            <SelectItem value="deepthink">DeepThink</SelectItem>
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
