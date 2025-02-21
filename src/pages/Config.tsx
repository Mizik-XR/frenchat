
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Cloud, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceConfig } from "@/hooks/useServiceConfig";

export const Config = () => {
  const navigate = useNavigate();
  const { getConfig } = useServiceConfig();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [openaiConfig, gdriveConfig, teamsConfig] = await Promise.all([
          getConfig('openai'),
          getConfig('google_drive'),
          getConfig('microsoft_teams')
        ]);
        console.log('Configurations chargées:', { openaiConfig, gdriveConfig, teamsConfig });
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des configurations:', error);
        setLoading(false);
      }
    };

    loadConfigs();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Configuration des services</h1>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            APIs IA
          </TabsTrigger>
          <TabsTrigger value="drive" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Google Drive
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Microsoft Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration des APIs IA</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">OpenAI</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Pour utiliser OpenAI, vous devez configurer votre clé API.
                  Vous pouvez l'obtenir sur le site d'OpenAI.
                </p>
                <Button onClick={() => {
                  window.open('https://platform.openai.com/api-keys', '_blank');
                }}>
                  Obtenir une clé API OpenAI
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Hugging Face</h3>
                <p className="text-sm text-gray-600">
                  Hugging Face est déjà configuré et fonctionne localement dans votre navigateur.
                  Aucune configuration supplémentaire n'est nécessaire.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="drive">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Google Drive</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Pour utiliser Google Drive, vous devez créer un projet dans la Google Cloud Console
                et configurer les identifiants OAuth2.
              </p>
              <div className="space-y-2">
                <Button onClick={() => {
                  window.open('https://console.cloud.google.com/apis/credentials', '_blank');
                }}>
                  Configurer Google Drive
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Microsoft Teams</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Pour utiliser Microsoft Teams, vous devez enregistrer votre application
                dans le portail Azure et configurer les identifiants.
              </p>
              <div className="space-y-2">
                <Button onClick={() => {
                  window.open('https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade', '_blank');
                }}>
                  Configurer Microsoft Teams
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
