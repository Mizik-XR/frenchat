
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { AIModel } from "./types";
import { CustomModelForm } from "./CustomModelForm";

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
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {type === "local" 
                    ? "Les modèles locaux s'exécutent sur votre machine sans clé API" 
                    : "Les modèles cloud offrent de meilleures performances via des API"
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <Select
          value={selectedModel}
          onValueChange={onModelSelect}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Sélectionner un modèle" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border">
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-sm text-gray-500">
                    {model.description}
                  </span>
                  {type === "local" ? (
                    <span className="text-xs text-green-600 mt-1">
                      Aucune clé API requise
                    </span>
                  ) : model.requiresKey ? (
                    <span className="text-xs text-amber-600 mt-1">
                      Requiert une clé API
                    </span>
                  ) : (
                    <span className="text-xs text-blue-600 mt-1">
                      Clé API optionnelle
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedModelConfig?.isCustom && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200 animate-in fade-in-50 duration-200">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              ID du modèle Hugging Face
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Entrez l'ID complet du modèle tel qu'il apparaît sur Hugging Face
                      (ex: facebook/opt-350m)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input 
              placeholder="Ex: facebook/opt-350m"
              className="w-full"
              onChange={(e) => {
                onModelAdd({
                  ...selectedModelConfig,
                  modelId: e.target.value
                });
              }}
            />
          </div>
        </div>
      )}

      <CustomModelForm 
        type={type}
        onModelAdd={onModelAdd}
      />
    </div>
  );
}
