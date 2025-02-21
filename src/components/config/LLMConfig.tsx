
import { LLMProvider, LLMConfig as LLMConfigType, ServiceType } from "@/types/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Plateforme open source avec de nombreux modèles gratuits.',
    models: ['mistral-7b', 'llama-2', 'falcon-40b'],
    docsUrl: 'https://huggingface.co/docs/api-inference/index',
    requiresApiKey: false
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Service payant avec d\'excellentes performances. Nécessite une clé API.',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    docsUrl: 'https://platform.openai.com/docs/api-reference',
    requiresApiKey: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Alternative performante pour les tâches spécialisées. Nécessite une clé API.',
    models: ['deepseek-coder', 'deepseek-chat'],
    docsUrl: 'https://github.com/deepseek-ai/DeepSeek-LLM',
    requiresApiKey: true
  }
];

interface LLMConfigProps {
  config: LLMConfigType;
  onConfigChange: (config: LLMConfigType) => void;
  onSave: () => void;
}

export const LLMConfigComponent = ({ config, onConfigChange, onSave }: LLMConfigProps) => {
  const selectedProvider = LLM_PROVIDERS.find(p => p.id === config.provider);

  const handleProviderChange = (value: ServiceType) => {
    const newProvider = LLM_PROVIDERS.find(p => p.id === value);
    
    if (newProvider && !newProvider.requiresApiKey && config.apiKey) {
      toast({
        title: "Information",
        description: `${newProvider.name} ne nécessite pas de clé API pour les modèles open source.`,
      });
    }

    onConfigChange({
      ...config,
      provider: value,
      model: '',
      apiKey: newProvider?.requiresApiKey ? config.apiKey : ''
    });
  };

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuration du Modèle de Langage</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sélectionnez et configurez le modèle de langage pour l'analyse de vos documents.
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-5 w-5 text-primary/60" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Hugging Face propose des modèles open source gratuits ne nécessitant pas de clé API.
                Les autres fournisseurs peuvent nécessiter une clé API et engendrer des coûts.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-gray-700">Fournisseur LLM</Label>
          <Select
            value={config.provider}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choisissez un fournisseur" />
            </SelectTrigger>
            <SelectContent>
              {LLM_PROVIDERS.map((provider) => (
                <SelectItem 
                  key={provider.id} 
                  value={provider.id}
                  className="py-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{provider.name}</span>
                    <span className="text-xs text-gray-500">{provider.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProvider && (
          <>
            <div>
              <Label className="text-gray-700">Modèle</Label>
              <Select
                value={config.model}
                onValueChange={(value) => 
                  onConfigChange({ ...config, model: value })
                }
              >
                <SelectTrigger className="mt-1">
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

            {selectedProvider.requiresApiKey && (
              <div>
                <Label className="text-gray-700">Clé API</Label>
                <Input
                  type="password"
                  placeholder="Votre clé API"
                  value={config.apiKey}
                  onChange={(e) => 
                    onConfigChange({ ...config, apiKey: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            )}

            <div className="pt-4">
              <Button 
                className="w-full"
                onClick={onSave}
                disabled={
                  !config.provider || 
                  !config.model || 
                  (selectedProvider.requiresApiKey && !config.apiKey)
                }
              >
                Sauvegarder la configuration
              </Button>
            </div>

            <div className="mt-4 p-4 bg-primary/5 rounded-md">
              <h3 className="text-sm font-medium text-primary mb-2">
                Documentation {selectedProvider.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {selectedProvider.description}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(selectedProvider.docsUrl, '_blank')}
                className="w-full"
              >
                Voir la documentation
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
