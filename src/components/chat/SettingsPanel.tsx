
import { Cloud, Key, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIProvider, WebUIConfig } from "@/types/chat";
import { AIProviderSelect } from "./AIProviderSelect";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleConfigClick = () => {
    navigate('/config');
  };

  return (
    <Card className="absolute top-16 right-4 z-10 p-4 w-80 bg-gray-50/90 backdrop-blur supports-[backdrop-filter]:bg-gray-50/90">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Paramètres</h2>
          <p className="text-sm text-muted-foreground">
            Ajustez les paramètres de l'IA et la configuration
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Modèle IA</label>
            <AIProviderSelect 
              aiProvider={webUIConfig.model} 
              onProviderChange={onProviderChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Température</label>
            <div className="flex items-center gap-2">
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={webUIConfig.temperature}
                onChange={(e) => onWebUIConfigChange({ temperature: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-12 text-right">
                {webUIConfig.temperature}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tokens maximum</label>
            <Input
              type="number"
              min="100"
              max="4000"
              value={webUIConfig.maxTokens}
              onChange={(e) => onWebUIConfigChange({ maxTokens: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Configuration</h3>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleConfigClick}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuration des APIs
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
