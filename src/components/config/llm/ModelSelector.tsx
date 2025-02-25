
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HelpCircle, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { AIModel } from "./types";
import { CustomModelForm } from "./CustomModelForm";
import { Card } from "@/components/ui/card";

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  onModelAdd: (model: AIModel) => void;
  label: string;
  type: "local" | "cloud";
}

export function ModelSelector({ 
  models, 
  selectedModel, 
  onModelSelect, 
  onModelAdd,
  label,
  type 
}: ModelSelectorProps) {
  const selectedModelConfig = models.find(m => m.id === selectedModel);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-base font-medium text-gray-900 flex items-center gap-2">
            {label}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white p-2">
                  <p>
                    {type === "local" 
                      ? "Les modèles locaux s'exécutent sur votre machine sans clé API" 
                      : "Les modèles cloud offrent de meilleures performances via des API"
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
        </div>

        <Select
          value={selectedModel}
          onValueChange={onModelSelect}
        >
          <SelectTrigger className="w-full bg-white text-base">
            <SelectValue placeholder="Sélectionner un modèle" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border">
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id} className="py-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-base">{model.name}</span>
                  <span className="text-sm text-gray-500">
                    {model.description}
                  </span>
                  {type === "local" ? (
                    <span className="text-sm text-green-600 mt-1 font-medium">
                      Aucune clé API requise
                    </span>
                  ) : model.requiresKey ? (
                    <span className="text-sm text-amber-600 mt-1 font-medium">
                      Requiert une clé API
                    </span>
                  ) : (
                    <span className="text-sm text-blue-600 mt-1 font-medium">
                      Clé API optionnelle
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedModelConfig && selectedModelConfig.configFields && (
        <Card className="p-4 bg-gray-50 border-gray-200 space-y-6 animate-in fade-in-50 duration-200">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Configuration requise pour {selectedModelConfig.name}
            </AlertDescription>
          </Alert>

          {selectedModelConfig.configFields.apiKey && (
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
                className="w-full font-mono text-base"
                onChange={(e) => {
                  onModelAdd({
                    ...selectedModelConfig,
                    apiKey: e.target.value
                  });
                }}
              />
              {selectedModelConfig.docsUrl && (
                <a 
                  href={selectedModelConfig.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-block mt-1"
                >
                  Obtenir une clé API
                </a>
              )}
            </div>
          )}

          {selectedModelConfig.configFields.modelName && (
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
                className="w-full font-mono text-base"
                onChange={(e) => {
                  onModelAdd({
                    ...selectedModelConfig,
                    modelId: e.target.value
                  });
                }}
              />
            </div>
          )}

          {selectedModelConfig.configFields.temperature && (
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
              <Slider
                defaultValue={[0.7]}
                max={1}
                step={0.1}
                className="w-full"
                onValueChange={([value]) => {
                  onModelAdd({
                    ...selectedModelConfig,
                    temperature: value
                  });
                }}
              />
            </div>
          )}
        </Card>
      )}

      {selectedModelConfig?.isCustom && (
        <Card className="p-4 bg-gray-50 border-gray-200 space-y-4 animate-in fade-in-50 duration-200">
          <div className="space-y-2">
            <Label className="text-gray-700 flex items-center gap-2">
              ID du modèle Hugging Face
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Entrez l'ID complet du modèle tel qu'il apparaît sur Hugging Face</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input 
              placeholder="Ex: facebook/opt-350m"
              className="w-full font-mono text-base"
              onChange={(e) => {
                onModelAdd({
                  ...selectedModelConfig,
                  modelId: e.target.value
                });
              }}
            />
          </div>
        </Card>
      )}

      <CustomModelForm 
        type={type}
        onModelAdd={onModelAdd}
      />
    </div>
  );
}
