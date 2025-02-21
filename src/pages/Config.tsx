
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cloud, Key, Bot, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceConfig } from "@/hooks/useServiceConfig";
import { LLMConfigComponent } from "@/components/config/LLMConfig";
import { LLM_PROVIDERS } from "@/components/config/llm/constants";
import { ImageConfig } from "@/components/config/ImageConfig";
import { LLMConfig, GoogleConfig, TeamsConfig } from "@/types/config";
import { GoogleDriveConfig } from "@/components/config/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";

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
  
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'huggingface',
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
        
        if (gdriveConfig) setGoogleConfig(gdriveConfig as GoogleConfig);
        if (teamsConfig) setTeamsConfig(teamsConfig as TeamsConfig);
        if (openaiConfig) setLlmConfig(openaiConfig as LLMConfig);
        
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
      const provider = LLM_PROVIDERS.find(p => p.id === llmConfig.provider);
      
      if (!provider) {
        toast({
          title: "Erreur de configuration",
          description: "Fournisseur LLM invalide.",
          variant: "destructive",
        });
        return;
      }

      if (!llmConfig.model) {
        toast({
          title: "Champs manquants",
          description: "Veuillez sélectionner un modèle.",
          variant: "destructive",
        });
        return;
      }

      if (provider.requiresApiKey && !llmConfig.apiKey) {
        toast({
          title: "Champs manquants",
          description: "Une clé API est requise pour ce fournisseur.",
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
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Configuration des API</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Cette page vous permet de configurer les différentes API nécessaires au fonctionnement de l'application.
          Chaque section contient des instructions détaillées et des liens vers la documentation pertinente.
        </p>
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
