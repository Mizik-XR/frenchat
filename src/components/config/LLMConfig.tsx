
import { useState } from 'react';
import { LLMConfig as LLMConfigType, ServiceType } from "@/types/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { LLM_PROVIDERS } from "./llm/constants";
import { ProviderSelector } from "./llm/ProviderSelector";
import { ModelSelector } from "./llm/ModelSelector";
import { ProviderDocs } from "./llm/ProviderDocs";
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';

interface LLMConfigProps {
  onSave?: () => void;
}

export const LLMConfigComponent = ({ onSave }: LLMConfigProps) => {
  const { config, status, updateConfig } = useServiceConfiguration('llm' as ServiceType);
  const [localConfig, setLocalConfig] = useState<LLMConfigType>({
    provider: config?.provider || 'huggingface',
    model: config?.model || '',
    apiKey: config?.apiKey || '',
    rateLimit: config?.rateLimit || 10,
    useLocal: config?.useLocal || false,
    batchSize: config?.batchSize || 10,
    cacheEnabled: config?.cacheEnabled || true
  });

  const selectedProvider = LLM_PROVIDERS.find(p => p.id === localConfig.provider);

  const handleProviderChange = (value: ServiceType) => {
    const newProvider = LLM_PROVIDERS.find(p => p.id === value);
    
    if (newProvider && !newProvider.requiresApiKey && localConfig.apiKey) {
      toast({
        title: "Information",
        description: `${newProvider.name} ne nécessite pas de clé API pour les modèles open source.`,
      });
    }

    setLocalConfig(prev => ({
      ...prev,
      provider: value,
      model: '',
      apiKey: newProvider?.requiresApiKey ? prev.apiKey : '',
      useLocal: newProvider?.isLocal || false
    }));
  };

  const handleSave = async () => {
    try {
      await updateConfig(localConfig);
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving config:', error);
    }
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
        {status === 'configured' && (
          <Alert className="max-w-xs">
            <AlertDescription className="text-green-600">
              Configuration actuelle : {selectedProvider?.name}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-6">
        <ProviderSelector 
          value={localConfig.provider} 
          onValueChange={handleProviderChange}
        />

        {selectedProvider && (
          <>
            <ModelSelector
              value={localConfig.model}
              models={selectedProvider.models}
              onValueChange={(value) => setLocalConfig(prev => ({ ...prev, model: value }))}
            />

            {selectedProvider.requiresApiKey && (
              <div>
                <Label className="text-gray-700">Clé API</Label>
                <Input
                  type="password"
                  placeholder="Votre clé API"
                  value={localConfig.apiKey}
                  onChange={(e) => 
                    setLocalConfig(prev => ({ ...prev, apiKey: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-700">Activer le cache</Label>
                  <p className="text-sm text-gray-500">
                    Améliore les performances en mettant en cache les résultats
                  </p>
                </div>
                <Switch
                  checked={localConfig.cacheEnabled}
                  onCheckedChange={(checked) =>
                    setLocalConfig(prev => ({ ...prev, cacheEnabled: checked }))
                  }
                />
              </div>

              <div>
                <Label className="text-gray-700">Taille des lots (batching)</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={localConfig.batchSize}
                  onChange={(e) =>
                    setLocalConfig(prev => ({
                      ...prev,
                      batchSize: parseInt(e.target.value) || 10,
                    }))
                  }
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Nombre de documents traités simultanément pour l'indexation
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                className="w-full"
                onClick={handleSave}
                disabled={
                  !localConfig.provider || 
                  !localConfig.model || 
                  (selectedProvider.requiresApiKey && !localConfig.apiKey)
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
