
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cloud, Key, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceConfig } from "@/hooks/useServiceConfig";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Config = () => {
  const navigate = useNavigate();
  const { getConfig, saveConfig } = useServiceConfig();
  const [loading, setLoading] = useState(true);

  // États pour les formulaires
  const [googleConfig, setGoogleConfig] = useState({
    clientId: '',
    apiKey: ''
  });
  const [teamsConfig, setTeamsConfig] = useState({
    clientId: '',
    tenantId: ''
  });

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [gdriveConfig, teamsConfig] = await Promise.all([
          getConfig('google_drive'),
          getConfig('microsoft_teams')
        ]);
        console.info('Configurations chargées:', { gdriveConfig, teamsConfig });
        
        if (gdriveConfig) {
          setGoogleConfig(gdriveConfig);
        }
        if (teamsConfig) {
          setTeamsConfig(teamsConfig);
        }
        
        setLoading(false);
        
        if (!gdriveConfig || !teamsConfig) {
          toast({
            title: "Configuration requise",
            description: "Veuillez configurer vos API pour commencer à utiliser l'application.",
          });
        }
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
      await saveConfig('google_drive', googleConfig);
      toast({
        title: "Configuration sauvegardée",
        description: "Les identifiants Google Drive ont été enregistrés avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration Google Drive.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTeamsConfig = async () => {
    try {
      await saveConfig('microsoft_teams', teamsConfig);
      toast({
        title: "Configuration sauvegardée",
        description: "Les identifiants Microsoft Teams ont été enregistrés avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration Microsoft Teams.",
        variant: "destructive",
      });
    }
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
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="drive" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Google Drive
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Microsoft Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drive">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold">Configuration Google Drive</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-5 w-5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Vous devez créer un projet dans la Google Cloud Console
                      et configurer les identifiants OAuth2.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Pour utiliser Google Drive, suivez ces étapes :
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 mb-6">
                  <li>Créez un projet dans la Google Cloud Console</li>
                  <li>Activez l'API Google Drive</li>
                  <li>Configurez les identifiants OAuth2</li>
                  <li>Copiez vos identifiants ci-dessous</li>
                </ol>
                <Button 
                  variant="outline"
                  onClick={() => {
                    window.open('https://console.cloud.google.com/apis/credentials', '_blank');
                    toast({
                      title: "Page Google Cloud Console ouverte",
                      description: "Suivez les instructions pour obtenir vos identifiants.",
                    });
                  }}
                  className="mb-6"
                >
                  Ouvrir Google Cloud Console
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="googleClientId">Client ID</Label>
                  <Input
                    id="googleClientId"
                    placeholder="Votre Google Client ID"
                    value={googleConfig.clientId}
                    onChange={(e) => setGoogleConfig(prev => ({
                      ...prev,
                      clientId: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleApiKey">API Key</Label>
                  <Input
                    id="googleApiKey"
                    placeholder="Votre Google API Key"
                    value={googleConfig.apiKey}
                    onChange={(e) => setGoogleConfig(prev => ({
                      ...prev,
                      apiKey: e.target.value
                    }))}
                  />
                </div>
                <Button 
                  onClick={handleSaveGoogleConfig}
                  className="w-full"
                  disabled={!googleConfig.clientId || !googleConfig.apiKey}
                >
                  Sauvegarder la configuration Google Drive
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold">Configuration Microsoft Teams</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-5 w-5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Vous devez enregistrer votre application dans le portail Azure
                      et configurer les identifiants.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Pour utiliser Microsoft Teams, suivez ces étapes :
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 mb-6">
                  <li>Accédez au portail Azure</li>
                  <li>Enregistrez une nouvelle application</li>
                  <li>Configurez les permissions Teams</li>
                  <li>Copiez vos identifiants ci-dessous</li>
                </ol>
                <Button 
                  variant="outline"
                  onClick={() => {
                    window.open('https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade', '_blank');
                    toast({
                      title: "Portail Azure ouvert",
                      description: "Suivez les instructions pour obtenir vos identifiants.",
                    });
                  }}
                  className="mb-6"
                >
                  Ouvrir le portail Azure
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamsClientId">Client ID</Label>
                  <Input
                    id="teamsClientId"
                    placeholder="Votre Teams Client ID"
                    value={teamsConfig.clientId}
                    onChange={(e) => setTeamsConfig(prev => ({
                      ...prev,
                      clientId: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamsTenantId">Tenant ID</Label>
                  <Input
                    id="teamsTenantId"
                    placeholder="Votre Teams Tenant ID"
                    value={teamsConfig.tenantId}
                    onChange={(e) => setTeamsConfig(prev => ({
                      ...prev,
                      tenantId: e.target.value
                    }))}
                  />
                </div>
                <Button 
                  onClick={handleSaveTeamsConfig}
                  className="w-full"
                  disabled={!teamsConfig.clientId || !teamsConfig.tenantId}
                >
                  Sauvegarder la configuration Microsoft Teams
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
