
import { Cloud, Key, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIProvider, WebUIConfig } from "@/types/chat";
import { AIProviderSelect } from "./AIProviderSelect";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <Card className="absolute top-16 right-4 z-10 p-4 w-[500px] bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200">
      <Tabs defaultValue="ia" className="w-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Configuration des APIs</h2>
          </div>
          
          <TabsList className="w-full border-b">
            <TabsTrigger value="ia" className="flex-1">API IA</TabsTrigger>
            <TabsTrigger value="google" className="flex-1">Google Drive</TabsTrigger>
            <TabsTrigger value="microsoft" className="flex-1">Microsoft</TabsTrigger>
            <TabsTrigger value="images" className="flex-1">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="ia" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Configuration Google Drive</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleConfigClick}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Configurer Google Drive
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="microsoft" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Configuration Microsoft</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleConfigClick}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Configurer Microsoft Teams
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Configuration Stable Diffusion</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleConfigClick}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Configurer Stable Diffusion
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};
