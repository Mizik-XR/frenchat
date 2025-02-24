
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BrainCircuit, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LOCAL_MODELS = [
  {
    id: "deepseek-local",
    name: "DeepSeek",
    description: "Modèle local DeepSeek optimisé"
  },
  {
    id: "qwen-local",
    name: "Qwen 2.5",
    description: "Version locale de Qwen (léger et rapide)"
  },
  {
    id: "ollama-local",
    name: "Ollama",
    description: "Modèles locaux via Ollama"
  }
];

const CLOUD_MODELS = [
  {
    id: "huggingface/mistral",
    name: "Mistral AI",
    description: "Modèle performant via Hugging Face",
    requiresKey: false
  },
  {
    id: "anthropic/claude",
    name: "Claude (Anthropic)",
    description: "Assistant IA avancé (optionnel)",
    requiresKey: true,
    docsUrl: "https://console.anthropic.com/account/keys"
  },
  {
    id: "openai/gpt4",
    name: "GPT-4 (OpenAI)",
    description: "Modèle avancé OpenAI (optionnel)",
    requiresKey: true,
    docsUrl: "https://platform.openai.com/api-keys"
  },
  {
    id: "perplexity/pplx",
    name: "Perplexity AI",
    description: "API Perplexity (optionnel)",
    requiresKey: true,
    docsUrl: "https://docs.perplexity.ai/docs/getting-started"
  }
];

export function LocalAIConfig() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [deploymentType, setDeploymentType] = useState<"local" | "cloud">("local");
  const [isConfiguring, setIsConfiguring] = useState(false);

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

  const handleSaveConfig = async () => {
    setIsConfiguring(true);
    try {
      const modelConfig = [...LOCAL_MODELS, ...CLOUD_MODELS].find(m => m.id === selectedModel);
      
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
            variant: "warning"
          });
          setIsConfiguring(false);
          return;
        }
      }

      const response = await supabase.functions.invoke('check-model-availability', {
        body: { 
          modelType: deploymentType,
          modelId: selectedModel 
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
            type: deploymentType
          },
          status: 'configured'
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration du modèle a été mise à jour avec succès",
      });
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

  const selectedModelConfig = [...LOCAL_MODELS, ...CLOUD_MODELS].find(m => m.id === selectedModel);

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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sélectionner un modèle local
                </label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCAL_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-sm text-gray-500">
                            {model.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="cloud" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sélectionner un modèle cloud
                </label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLOUD_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-sm text-gray-500">
                            {model.description}
                          </span>
                          {model.requiresKey && (
                            <span className="text-xs text-amber-600 mt-1">
                              Requiert une clé API
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
