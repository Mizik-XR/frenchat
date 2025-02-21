
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

const STABLE_DIFFUSION_MODELS = ['sd-v1.5', 'sd-v2.1', 'sdxl'];

interface ImageConfigProps {
  model: string;
  onModelChange: (model: string) => void;
}

export const ImageConfig = ({ model, onModelChange }: ImageConfigProps) => {
  return (
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
              value={model}
              onValueChange={onModelChange}
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
  );
};
