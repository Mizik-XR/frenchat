
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

const LLM_PROVIDERS: LLMProvider[] = [
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
  }
];

interface LLMConfigProps {
  config: LLMConfigType;
  onConfigChange: (config: LLMConfigType) => void;
  onSave: () => void;
}

export const LLMConfigComponent = ({ config, onConfigChange, onSave }: LLMConfigProps) => {
  const selectedProvider = LLM_PROVIDERS.find(p => p.id === config.provider);

  return (
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
              value={config.provider}
              onValueChange={(value: ServiceType) => {
                onConfigChange({
                  ...config,
                  provider: value,
                  model: ''
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {LLM_PROVIDERS.map((provider) => (
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
                  value={config.model}
                  onValueChange={(value) => 
                    onConfigChange({ ...config, model: value })
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
                  value={config.apiKey}
                  onChange={(e) => 
                    onConfigChange({ ...config, apiKey: e.target.value })
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
                  value={config.rateLimit}
                  onChange={(e) => 
                    onConfigChange({ 
                      ...config, 
                      rateLimit: parseInt(e.target.value) || 0 
                    })
                  }
                />
              </div>

              <Button 
                className="w-full"
                onClick={onSave}
                disabled={!config.provider || !config.model || !config.apiKey}
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
  );
};
