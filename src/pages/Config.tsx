
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, Key, Bot, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceConfig } from "@/hooks/useServiceConfig";
import { ConfigHeader } from "@/components/config/ConfigHeader";
import { ConfigIntro } from "@/components/config/ConfigIntro";
import { LLMConfigComponent } from "@/components/config/LLMConfig";
import { ImageConfig } from "@/components/config/ImageConfig";
import { GoogleDriveConfig } from "@/components/config/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";
import { toast } from "@/hooks/use-toast";
import { GoogleConfig, TeamsConfig, LLMConfig as LLMConfigType } from "@/types/config";

export const Config = () => {
  const navigate = useNavigate();
  const { getConfig, saveConfig } = useServiceConfig();
  const [loading, setLoading] = useState(true);

  const [googleConfig, setGoogleConfig] = useState<GoogleConfig>({
    clientId: '',
    apiKey: ''
  });
  
  const [teamsConfig, setTeamsConfig] = useState<TeamsConfig>({
    clientId: '',
    tenantId: ''
  });
  
  const [llmConfig, setLlmConfig] = useState<LLMConfigType>({
    provider: 'huggingface',
    apiKey: '',
    model: '',
    rateLimit: 0
  });

  useState(() => {
    const loadConfigs = async () => {
      try {
        const [gdriveConfig, teamsConfig, openaiConfig] = await Promise.all([
          getConfig('google_drive'),
          getConfig('microsoft_teams'),
          getConfig('openai')
        ]);
        
        if (gdriveConfig) setGoogleConfig(gdriveConfig as GoogleConfig);
        if (teamsConfig) setTeamsConfig(teamsConfig as TeamsConfig);
        if (openaiConfig) setLlmConfig(openaiConfig as LLMConfigType);
        
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
    try {
      if (!googleConfig.clientId || !googleConfig.apiKey) {
        toast({
          title: "Champs manquants",
          description: "Veuillez remplir tous les champs requis.",
          variant: "destructive",
        });
        return;
      }
      await saveConfig('google_drive', googleConfig);
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres Google Drive ont été enregistrés avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration Google Drive.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTeamsConfig = async () => {
    try {
      if (!teamsConfig.clientId || !teamsConfig.tenantId) {
        toast({
          title: "Champs manquants",
          description: "Veuillez remplir tous les champs requis.",
          variant: "destructive",
        });
        return;
      }
      await saveConfig('microsoft_teams', teamsConfig);
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres Microsoft Teams ont été enregistrés avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration Microsoft Teams.",
        variant: "destructive",
      });
    }
  };

  const handleSaveLLMConfig = async () => {
    try {
      if (!llmConfig.provider || !llmConfig.model) {
        toast({
          title: "Champs manquants",
          description: "Veuillez sélectionner un fournisseur et un modèle.",
          variant: "destructive",
        });
        return;
      }

      await saveConfig(llmConfig.provider, {
        ...llmConfig,
        rateLimit: Number(llmConfig.rateLimit)
      });

      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres du modèle de langage ont été enregistrés avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration du modèle de langage.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg text-primary">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-gray-50">
      <ConfigHeader onBack={() => navigate('/')} />
      <ConfigIntro />

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
