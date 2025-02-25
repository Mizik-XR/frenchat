
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HelpCircle, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AIModel } from "../types";

interface ModelConfigurationFieldsProps {
  model: AIModel;
  onModelUpdate: (model: AIModel) => void;
}

export function ModelConfigurationFields({ model, onModelUpdate }: ModelConfigurationFieldsProps) {
  if (!model.configFields) return null;

  return (
    <Card className="p-4 bg-gray-50 border-gray-200 space-y-6 animate-in fade-in-50 duration-200">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Configuration requise pour {model.name}
        </AlertDescription>
      </Alert>

      <Separator className="my-4" />

      {model.configFields.apiKey && (
        <div className="space-y-2">
          <Label className="text-gray-700 flex items-center gap-2">
            Clé API
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clé API requise pour utiliser ce modèle</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input 
            type="password"
            placeholder="sk-..."
            className="w-full font-mono text-base bg-white"
            onChange={(e) => {
              onModelUpdate({
                ...model,
                apiKey: e.target.value
              });
            }}
          />
          {model.docsUrl && (
            <a 
              href={model.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-block mt-1"
            >
              Obtenir une clé API
            </a>
          )}
        </div>
      )}

      {model.configFields.modelName && (
        <div className="space-y-2">
          <Label className="text-gray-700 flex items-center gap-2">
            Nom du modèle
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Le modèle spécifique à utiliser (ex: gpt-4-turbo-preview)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input 
            placeholder="gpt-4-turbo-preview"
            className="w-full font-mono text-base bg-white"
            onChange={(e) => {
              onModelUpdate({
                ...model,
                modelId: e.target.value
              });
            }}
          />
        </div>
      )}

      {model.configFields.temperature && (
        <div className="space-y-4">
          <Label className="text-gray-700 flex items-center gap-2">
            Température
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contrôle la créativité du modèle (0 = précis, 1 = créatif)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              defaultValue={[0.7]}
              max={1}
              step={0.1}
              className="flex-1"
              onValueChange={([value]) => {
                onModelUpdate({
                  ...model,
                  temperature: value
                });
              }}
            />
            <span className="text-sm text-gray-600 min-w-[40px]">
              {model.temperature?.toFixed(1) || "0.7"}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
