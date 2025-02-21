import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cloud, Key, Bot, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceConfig } from "@/hooks/useServiceConfig";
import { LLMConfigComponent } from "@/components/config/LLMConfig";
import { ImageConfig } from "@/components/config/ImageConfig";
import { LLMConfig } from "@/types/config";
import { GoogleDriveConfig } from "@/components/config/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";

export const Config = () => {
  const navigate = useNavigate();
  const { getConfig, saveConfig } = useServiceConfig();
  const [loading, setLoading] = useState(true);

  const [googleConfig, setGoogleConfig] = useState({
    clientId: '',
    apiKey: ''
  });
  const [teamsConfig, setTeamsConfig] = useState({
    clientId: '',
    tenantId: ''
  });
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'openai',
    apiKey: '',
    model: '',
    rateLimit: 0
  });

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [gdriveConfig, teamsConfig, openaiConfig] = await Promise.all([
          getConfig('google_drive'),
          getConfig('microsoft_teams'),
          getConfig('openai')
        ]);
        
        if (gdriveConfig) setGoogleConfig(gdriveConfig);
        if (teamsConfig) setTeamsConfig(teamsConfig);
        if (openaiConfig) setLlmConfig(openaiConfig);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des configurations:', error);
        setLoading(false);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les configurations. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    };

    loadConfigs();
  }, []);

  const handleSaveGoogleConfig = async () => {
    await saveConfig('google_drive', googleConfig);
  };

  const handleSaveTeamsConfig = async () => {
    await saveConfig('microsoft_teams', teamsConfig);
  };

  const handleSaveLLMConfig = async () => {
    await saveConfig(llmConfig.provider, {
      ...llmConfig,
      rateLimit: Number(llmConfig.rateLimit)
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Configuration des API</h1>
      </div>

      <Tabs defaultValue="drive" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="drive" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Google Drive
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Microsoft Teams
          </TabsTrigger>
          <TabsTrigger value="llm" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Modèle IA
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Génération d'images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drive">
          <GoogleDriveConfig 
            config={googleConfig}
            onConfigChange={setGoogleConfig}
            onSave={handleSaveGoogleConfig}
          />
        </TabsContent>

        <TabsContent value="teams">
          <MicrosoftTeamsConfig
            config={teamsConfig}
            onConfigChange={setTeamsConfig}
            onSave={handleSaveTeamsConfig}
          />
        </TabsContent>

        <TabsContent value="llm">
          <LLMConfigComponent
            config={llmConfig}
            onConfigChange={setLlmConfig}
            onSave={handleSaveLLMConfig}
          />
        </TabsContent>

        <TabsContent value="image">
          <ImageConfig
            model={llmConfig.model}
            onModelChange={(model) => setLlmConfig(prev => ({ ...prev, model }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
