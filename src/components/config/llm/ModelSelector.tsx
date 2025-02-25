
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { AIModel } from "./types";
import { CustomModelForm } from "./CustomModelForm";
import { ModelSelect } from "./components/ModelSelect";
import { ModelConfigurationFields } from "./components/ModelConfigurationFields";
import { CustomModelFields } from "./components/CustomModelFields";

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

        <ModelSelect
          models={models}
          selectedModel={selectedModel}
          onModelSelect={onModelSelect}
          type={type}
        />
      </div>

      {selectedModelConfig && (
        <>
          <ModelConfigurationFields
            model={selectedModelConfig}
            onModelUpdate={onModelAdd}
          />
          <CustomModelFields
            model={selectedModelConfig}
            onModelUpdate={onModelAdd}
          />
        </>
      )}

      <CustomModelForm 
        type={type}
        onModelAdd={onModelAdd}
      />
    </div>
  );
}
