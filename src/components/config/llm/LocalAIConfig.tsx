
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  BrainCircuit, 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle, 
  Info, 
  Server, 
  Cloud,
  HelpCircle 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOCAL_MODELS, CLOUD_MODELS, type AIModel } from "./types";
import { ModelSelector } from "./ModelSelector";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface LocalAIConfigProps {
  onSave?: () => void;
}

export function LocalAIConfig({ onSave }: LocalAIConfigProps) {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [deploymentType, setDeploymentType] = useState<"local" | "cloud">("cloud");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [localModels, setLocalModels] = useState<AIModel[]>(LOCAL_MODELS);
  const [cloudModels, setCloudModels] = useState<AIModel[]>(CLOUD_MODELS);
  const [hasConfiguration, setHasConfiguration] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    const { data, error } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'llm')
      .single();

    if (data?.config?.model) {
      setSelectedModel(data.config.model);
      setDeploymentType(data.config.type || "cloud");
      setHasConfiguration(true);
    }
  };

  const handleModelAdd = (type: "local" | "cloud") => (newModel: AIModel) => {
    if (type === "local") {
      setLocalModels(prev => [...prev, newModel]);
    } else {
      setCloudModels(prev => [...prev, newModel]);
    }
  };

  const activateDefaultModel = async () => {
    setIsConfiguring(true);
    try {
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          service_type: 'llm',
          config: { 
            model: "huggingface/mistral",
            type: "cloud",
            customModelId: "mistralai/Mistral-7B-Instruct-v0.1"
          },
          status: 'configured'
        });

      if (error) throw error;

      toast({
        title: "Configuration par défaut activée",
        description: "Le modèle Mistral a été configuré avec succès",
      });

      setHasConfiguration(true);
      setSelectedModel("huggingface/mistral");
      setDeploymentType("cloud");
      onSave?.();
    } catch (error) {
      console.error('Erreur de configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer la configuration par défaut",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsConfiguring(true);
    try {
      const modelConfig = [...localModels, ...cloudModels].find(m => m.id === selectedModel);
      
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          service_type: 'llm',
          config: { 
            model: selectedModel,
            type: deploymentType,
            customModelId: modelConfig?.modelId
          },
          status: 'configured'
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration du modèle a été mise à jour avec succès",
      });

      setHasConfiguration(true);
      onSave?.();
    } catch (error) {
      console.error('Erreur de configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const selectedModelConfig = [...localModels, ...cloudModels].find(m => m.id === selectedModel);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-7 w-7 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">Configuration de l'IA</h2>
          {hasConfiguration && (
            <Badge variant="default" className="ml-2 bg-green-500 hover:bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configuré
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/config")}
          className="gap-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* First-time setup card */}
      {!hasConfiguration && (
        <Card className="overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Info className="h-8 w-8 text-blue-500 mt-1 shrink-0" />
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl font-semibold text-blue-900">Première utilisation ?</h3>
                  <p className="text-blue-700 mt-3 leading-relaxed">
                    Pour commencer rapidement, nous recommandons d'utiliser notre configuration par défaut 
                    basée sur le modèle Mistral via Hugging Face. Ce modèle offre un excellent équilibre 
                    entre performances et facilité d'utilisation.
                  </p>
                </div>
                <Button
                  onClick={activateDefaultModel}
                  disabled={isConfiguring}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isConfiguring ? "Configuration en cours..." : "Activer la configuration par défaut"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions alert */}
      <Alert className="bg-purple-50 border-purple-200 shadow-sm">
        <AlertCircle className="h-5 w-5 text-purple-500" />
        <AlertDescription className="text-purple-700 ml-2">
          <span className="font-semibold block mb-2">Comment configurer votre modèle IA :</span>
          <ul className="list-disc pl-6 space-y-2">
            <li>Choisissez entre un déploiement local (sans clé API) ou cloud</li>
            <li>Sélectionnez un modèle dans la liste proposée</li>
            <li>Pour les modèles cloud, vous pouvez optionnellement configurer une clé API</li>
            <li>Sauvegardez votre configuration pour l'appliquer</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Main configuration card */}
      <Card className="border border-gray-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2">
            Configuration du modèle
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="p-3 bg-white shadow-xl">
                  <p className="max-w-xs text-sm text-gray-600">
                    Choisissez entre un modèle local (exécuté sur votre machine) 
                    ou cloud (hébergé sur des serveurs distants).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Choisissez le type de déploiement et le modèle que vous souhaitez utiliser.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <Tabs 
            defaultValue={deploymentType} 
            onValueChange={(v) => setDeploymentType(v as "local" | "cloud")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="local" className="flex items-center gap-2 py-3">
                <Server className="h-4 w-4" />
                Local
              </TabsTrigger>
              <TabsTrigger value="cloud" className="flex items-center gap-2 py-3">
                <Cloud className="h-4 w-4" />
                Cloud
              </TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-6">
              <Alert className="bg-green-50 border-green-200 shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 ml-2">
                  Les modèles locaux s'exécutent directement sur votre machine et ne nécessitent pas de clé API.
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <ModelSelector
                  models={localModels}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  onModelAdd={handleModelAdd("local")}
                  label="Sélectionner un modèle local"
                  type="local"
                />
              </div>
            </TabsContent>

            <TabsContent value="cloud" className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200 shadow-sm">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700 ml-2">
                  Les modèles cloud offrent de meilleures performances et sont hébergés sur des serveurs distants.
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <ModelSelector
                  models={cloudModels}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  onModelAdd={handleModelAdd("cloud")}
                  label="Sélectionner un modèle cloud"
                  type="cloud"
                />
              </div>

              {selectedModelConfig?.requiresKey && selectedModelConfig?.docsUrl && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <a 
                    href={selectedModelConfig.docsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Obtenir une clé API
                  </a>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleSaveConfig}
            disabled={!selectedModel || isConfiguring}
            className="w-full h-12 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium"
          >
            {isConfiguring ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/60 border-t-white" />
                Configuration en cours...
              </div>
            ) : (
              "Sauvegarder la configuration"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
