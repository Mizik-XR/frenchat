
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';

const STABLE_DIFFUSION_MODELS = ['sd-v1.5', 'sd-v2.1', 'sdxl'];

interface ImageConfigProps {
  onSave?: () => void;
}

export const ImageConfig = ({ onSave }: ImageConfigProps) => {
  const { config, status, updateConfig, error } = useServiceConfiguration('stable_diffusion');
  const [selectedModel, setSelectedModel] = useState(config?.model || 'sd-v1.5');

  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    try {
      await updateConfig({ model });
      if (onSave) onSave();
    } catch (error) {
      console.error('Error updating model:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Configuration Stable Diffusion</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sélectionnez le modèle à utiliser pour la génération d'images
          </p>
        </div>
        
        {status === 'configured' && !error && (
          <Alert className="max-w-xs">
            <AlertDescription className="text-green-600">
              Modèle actuel : {selectedModel}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Impossible de charger la configuration. Les changements seront stockés localement.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Modèle Stable Diffusion</Label>
            <Select
              value={selectedModel}
              onValueChange={handleModelChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une version" />
              </SelectTrigger>
              <SelectContent>
                {STABLE_DIFFUSION_MODELS.map((model) => (
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
              La configuration actuelle sera utilisée pour toutes les générations d'images.
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
  );
};
