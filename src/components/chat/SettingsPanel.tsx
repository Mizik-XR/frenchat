
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

  return (
    <Card className="absolute top-16 right-4 z-10 p-4 w-80 bg-white/95 backdrop-blur-sm shadow-xl border border-blue-100 rounded-xl">
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Paramètres IA</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Modèle IA</label>
              <AIProviderSelect 
                aiProvider={webUIConfig.model} 
                onProviderChange={onProviderChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Température</label>
              <div className="flex items-center gap-2">
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={webUIConfig.temperature}
                  onChange={(e) => onWebUIConfigChange({ temperature: parseFloat(e.target.value) })}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-xs text-gray-500 w-8 text-right">
                  {webUIConfig.temperature}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Tokens maximum</label>
              <Input
                type="number"
                min="100"
                max="4000"
                value={webUIConfig.maxTokens}
                onChange={(e) => onWebUIConfigChange({ maxTokens: parseInt(e.target.value) })}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Configuration des APIs</h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/config')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurer les APIs
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
