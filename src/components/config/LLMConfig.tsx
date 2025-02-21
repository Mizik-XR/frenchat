
import { LLMConfig as LLMConfigType, ServiceType } from "@/types/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { LLM_PROVIDERS } from "./llm/constants";
import { ProviderSelector } from "./llm/ProviderSelector";
import { ModelSelector } from "./llm/ModelSelector";
import { ProviderDocs } from "./llm/ProviderDocs";

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
        <ProviderSelector 
          value={config.provider} 
          onValueChange={handleProviderChange}
        />

        {selectedProvider && (
          <>
            <ModelSelector
              value={config.model}
              models={selectedProvider.models}
              onValueChange={(value) => onConfigChange({ ...config, model: value })}
            />

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

            <ProviderDocs provider={selectedProvider} />
          </>
        )}
      </div>
    </Card>
  );
};
