import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ModelConfig {
  type: 'local' | 'api';
  id: string;
  name: string;
  description: string;
}

const LOCAL_MODELS: ModelConfig[] = [
  {
    type: 'local',
    id: 'deepseek',
    name: 'DeepSeek Local',
    description: 'Modèle local DeepSeek'
  },
  {
    type: 'local',
    id: 'qwen',
    name: 'Qwen 2.5',
    description: 'Modèle local Qwen'
  }
];

const API_MODELS: ModelConfig[] = [
  {
    type: 'api',
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 et autres modèles OpenAI'
  },
  {
    type: 'api',
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Modèles Claude d\'Anthropic'
  },
  {
    type: 'api',
    id: 'perplexity',
    name: 'Perplexity',
    description: 'API Perplexity AI'
  }
];

interface ModelSelectorProps {
  selectedType: 'local' | 'api';
  onTypeChange: (type: 'local' | 'api') => void;
}

export function ModelSelector({ selectedType, onTypeChange }: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    const { data, error } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'llm')
      .single();

    if (data?.config) {
      onTypeChange(data.config.type);
      setSelectedModel(data.config.modelId);
    }
  };

  const handleModelSelect = async (modelConfig: ModelConfig) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-model-availability', {
        body: { modelType: modelConfig.type, modelId: modelConfig.id }
      });

      if (error) throw error;

      await supabase
        .from('service_configurations')
        .upsert({
          service_type: 'llm',
          config: {
            type: modelConfig.type,
            modelId: modelConfig.id
          },
          status: 'configured'
        });

      toast({
        title: "Configuration mise à jour",
        description: `Le modèle ${modelConfig.name} a été configuré avec succès`
      });

      onTypeChange(modelConfig.type);
      setSelectedModel(modelConfig.id);
    } catch (error) {
      console.error('Erreur de configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de configurer le modèle sélectionné",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Choisissez entre les modèles locaux ou les API cloud.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-6">
          <RadioGroup
            value={selectedType}
            onValueChange={(value) => onTypeChange(value as 'local' | 'api')}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="local" id="local" />
              <Label htmlFor="local">Modèles Locaux</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="api" id="api" />
              <Label htmlFor="api">API Cloud</Label>
            </div>
          </RadioGroup>

          <div className="grid gap-4">
            {(selectedType === 'local' ? LOCAL_MODELS : API_MODELS).map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "default" : "outline"}
                className="justify-start"
                onClick={() => handleModelSelect(model)}
                disabled={isLoading}
              >
                <div className="text-left">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-gray-500">{model.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
