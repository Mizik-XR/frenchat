
import { Cloud, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
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

  return (
    <Card className="absolute top-16 right-4 z-10 p-4 w-[500px] bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200">
      <Tabs defaultValue="ia" className="w-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Configuration</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/config")}>
              Configuration avancée
            </Button>
          </div>
          
          <TabsList className="w-full">
            <TabsTrigger value="ia" className="flex-1">IA</TabsTrigger>
            <TabsTrigger value="sources" className="flex-1">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="ia" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <AIProviderSelect 
                  aiProvider={webUIConfig.model} 
                  onProviderChange={onProviderChange}
                />
                <Button 
                  variant="link" 
                  className="text-xs text-muted-foreground"
                  onClick={() => navigate("/config/cloud-ai")}
                >
                  Configurer le modèle d'IA
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/config")}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Configurer les sources de données
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};
