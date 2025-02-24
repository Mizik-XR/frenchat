import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BrainCircuit, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOCAL_MODELS, CLOUD_MODELS, type AIModel } from "./types";
import { ModelSelector } from "./ModelSelector";

interface LocalAIConfigProps {
  onSave?: () => void;
}

export function LocalAIConfig({ onSave }: LocalAIConfigProps) {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [deploymentType, setDeploymentType] = useState<"local" | "cloud">("local");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [localModels, setLocalModels] = useState<AIModel[]>(LOCAL_MODELS);
  const [cloudModels, setCloudModels] = useState<AIModel[]>(CLOUD_MODELS);

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
      setDeploymentType(data.config.type || "local");
    }
  };

  const handleModelAdd = (type: "local" | "cloud") => (newModel: AIModel) => {
    if (type === "local") {
      setLocalModels(prev => [...prev, newModel]);
    } else {
      setCloudModels(prev => [...prev, newModel]);
    }
  };

  const handleSaveConfig = async () => {
    setIsConfiguring(true);
    try {
      const modelConfig = [...localModels, ...cloudModels].find(m => m.id === selectedModel);
      
      if (modelConfig?.requiresKey) {
        const { data: keyCheck } = await supabase
          .from('service_configurations')
          .select('config')
          .eq('service_type', selectedModel.split('/')[0])
          .single();

        if (!keyCheck?.config?.apiKey) {
          toast({
            title: "Clé API requise",
            description: "Veuillez d'abord configurer la clé API pour ce fournisseur",
            variant: "destructive"
          });
          setIsConfiguring(false);
          return;
        }
      }

      const response = await supabase.functions.invoke('check-model-availability', {
        body: { 
          modelType: deploymentType,
          modelId: selectedModel,
          customModelId: modelConfig?.modelId
        }
      });

      if (!response.data) {
        throw new Error("Erreur lors de la vérification du modèle");
      }

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

      onSave?.();
    } catch (error) {
      console.error('Erreur de configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration.",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const selectedModelConfig = [...localModels, ...cloudModels].find(m => m.id === selectedModel);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Configuration de l'IA</h2>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/config")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Choisissez entre un déploiement local (aucune clé API requise) ou cloud. Les modèles cloud nécessitent parfois une clé API que vous pouvez configurer de manière optionnelle.
        </AlertDescription>
      </Alert>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Configuration du modèle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue={deploymentType} onValueChange={(v) => setDeploymentType(v as "local" | "cloud")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="local">Local</TabsTrigger>
              <TabsTrigger value="cloud">Cloud</TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-4">
              <ModelSelector
                models={localModels}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                onModelAdd={handleModelAdd("local")}
                label="Sélectionner un modèle local"
                type="local"
              />
            </TabsContent>

            <TabsContent value="cloud" className="space-y-4">
              <ModelSelector
                models={cloudModels}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                onModelAdd={handleModelAdd("cloud")}
                label="Sélectionner un modèle cloud"
                type="cloud"
              />

              {selectedModelConfig?.requiresKey && selectedModelConfig?.docsUrl && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={selectedModelConfig.docsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
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
            className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            {isConfiguring ? "Configuration..." : "Sauvegarder la configuration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
