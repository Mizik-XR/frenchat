import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cloud, Key, Bot, Image, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceConfig } from "@/hooks/useServiceConfig";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LLM_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Service payant avec d\'excellentes performances. Nécessite une clé API.',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    docsUrl: 'https://platform.openai.com/docs/api-reference'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Alternative open source gratuite, performante pour les tâches générales.',
    models: ['deepseek-coder', 'deepseek-chat'],
    docsUrl: 'https://github.com/deepseek-ai/DeepSeek-LLM'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Plateforme open source avec de nombreux modèles. Usage gratuit possible.',
    models: ['mistral-7b', 'llama-2', 'falcon-40b'],
    docsUrl: 'https://huggingface.co/docs/api-inference/index'
  },
  {
    id: 'stable_diffusion',
    name: 'Stable Diffusion',
    description: 'Génération d\'images basée sur l\'IA. Option gratuite avec installation locale.',
    models: ['sd-v1.5', 'sd-v2.1', 'sdxl'],
    docsUrl: 'https://github.com/CompVis/stable-diffusion'
  }
];

export const Config = () => {
  const navigate = useNavigate();
  const { getConfig, saveConfig } = useServiceConfig();
  const [loading, setLoading] = useState(true);

  // États pour les formulaires existants
  const [googleConfig, setGoogleConfig] = useState({
    clientId: '',
    apiKey: ''
  });
  const [teamsConfig, setTeamsConfig] = useState({
    clientId: '',
    tenantId: ''
  });

  // Nouvel état pour la configuration LLM
  const [llmConfig, setLlmConfig] = useState({
    provider: '',
    apiKey: '',
    model: '',
    rateLimit: 0
  });

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [gdriveConfig, teamsConfig, llmConfig] = await Promise.all([
          getConfig('google_drive'),
          getConfig('microsoft_teams'),
          getConfig('llm')
        ]);
        
        if (gdriveConfig) setGoogleConfig(gdriveConfig);
        if (teamsConfig) setTeamsConfig(teamsConfig);
        if (llmConfig) setLlmConfig(llmConfig);
        
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

  // Gestionnaires existants
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

  const handleSaveLLMConfig = async () => {
    try {
      await saveConfig('llm', {
        ...llmConfig,
        rateLimit: Number(llmConfig.rateLimit)
      });
      toast({
        title: "Configuration LLM sauvegardée",
        description: "Les paramètres du modèle de langage ont été enregistrés avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration LLM.",
        variant: "destructive",
      });
    }
  };

  const selectedProvider = LLM_PROVIDERS.find(p => p.id === llmConfig.provider);

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

        <TabsContent value="llm">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold">Configuration du Modèle de Langage</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-5 w-5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Choisissez et configurez le modèle de langage qui sera utilisé
                      pour analyser vos documents.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Fournisseur LLM</Label>
                  <Select
                    value={llmConfig.provider}
                    onValueChange={(value) => {
                      setLlmConfig(prev => ({
                        ...prev,
                        provider: value,
                        model: '' // Reset model when provider changes
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {LLM_PROVIDERS.filter(p => p.id !== 'stable_diffusion').map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex flex-col">
                            <span>{provider.name}</span>
                            <span className="text-xs text-gray-500">{provider.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProvider && (
                  <>
                    <div className="space-y-2">
                      <Label>Modèle</Label>
                      <Select
                        value={llmConfig.model}
                        onValueChange={(value) => 
                          setLlmConfig(prev => ({ ...prev, model: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un modèle" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProvider.models.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Clé API</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Votre clé API"
                        value={llmConfig.apiKey}
                        onChange={(e) => 
                          setLlmConfig(prev => ({ ...prev, apiKey: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rateLimit">
                        Limite de requêtes par minute
                        <span className="ml-2 text-sm text-gray-500">
                          (0 = illimité)
                        </span>
                      </Label>
                      <Input
                        id="rateLimit"
                        type="number"
                        min="0"
                        placeholder="Ex: 60"
                        value={llmConfig.rateLimit}
                        onChange={(e) => 
                          setLlmConfig(prev => ({ 
                            ...prev, 
                            rateLimit: parseInt(e.target.value) || 0 
                          }))
                        }
                      />
                    </div>

                    <Button 
                      className="w-full"
                      onClick={handleSaveLLMConfig}
                      disabled={!llmConfig.provider || !llmConfig.model || !llmConfig.apiKey}
                    >
                      Sauvegarder la configuration
                    </Button>

                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Documentation {selectedProvider.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {selectedProvider.description}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(selectedProvider.docsUrl, '_blank')}
                      >
                        Voir la documentation
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="image">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold">Configuration Stable Diffusion</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-5 w-5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Configurez Stable Diffusion pour la génération d'images basée sur l'IA.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Modèle Stable Diffusion</Label>
                  <Select
                    value={llmConfig.model}
                    onValueChange={(value) => 
                      setLlmConfig(prev => ({ ...prev, model: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une version" />
                    </SelectTrigger>
                    <SelectContent>
                      {LLM_PROVIDERS.find(p => p.id === 'stable_diffusion')?.models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    À propos de Stable Diffusion
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Stable Diffusion est un modèle de génération d'images gratuit et open source.
                    Vous pouvez l'utiliser localement ou via une API hébergée.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://github.com/CompVis/stable-diffusion', '_blank')}
                  >
                    Documentation Stable Diffusion
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
