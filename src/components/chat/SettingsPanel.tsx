
import { useState } from "react";
import { AIProvider } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingsPanelProps {
  webUIConfig: {
    mode: 'auto' | 'manual';
    model: AIProvider;
    maxTokens: number;
    temperature: number;
    streamResponse: boolean;
  };
  onWebUIConfigChange: (config: Partial<typeof webUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
}

export const SettingsPanel = ({
  webUIConfig,
  onWebUIConfigChange,
  onProviderChange,
}: SettingsPanelProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLocalModeChange = (enabled: boolean) => {
    if (enabled) {
      onProviderChange('huggingface');
    }
  };

  return (
    <div className="p-4 bg-white/80 rounded-lg mb-4 border border-gray-200 space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Configuration du modèle</Label>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Mode Local</Label>
              <p className="text-sm text-gray-500">Utiliser les modèles en local</p>
            </div>
            <Switch 
              checked={webUIConfig.model === 'huggingface'}
              onCheckedChange={handleLocalModeChange}
            />
          </div>

          <div>
            <Label>Nombre maximum de tokens</Label>
            <Input
              type="number"
              value={webUIConfig.maxTokens}
              onChange={(e) => onWebUIConfigChange({ maxTokens: parseInt(e.target.value) })}
              min={1}
              max={4096}
            />
          </div>

          <div>
            <Label>Température</Label>
            <Input
              type="number"
              value={webUIConfig.temperature}
              onChange={(e) => onWebUIConfigChange({ temperature: parseFloat(e.target.value) })}
              min={0}
              max={2}
              step={0.1}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Streaming</Label>
              <p className="text-sm text-gray-500">Afficher la réponse en temps réel</p>
            </div>
            <Switch
              checked={webUIConfig.streamResponse}
              onCheckedChange={(checked) => onWebUIConfigChange({ streamResponse: checked })}
            />
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? "Masquer les options avancées" : "Afficher les options avancées"}
      </Button>
    </div>
  );
};
