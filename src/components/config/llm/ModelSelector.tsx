
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, PlusCircle } from "lucide-react";
import type { AIModel } from "./types";
import { CustomModelForm } from "./CustomModelForm";
import { ModelSelect } from "./components/ModelSelect";
import { ModelConfigurationFields } from "./components/ModelConfigurationFields";
import { CustomModelFields } from "./components/CustomModelFields";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  const [showCustomForm, setShowCustomForm] = useState(false);

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
                <TooltipContent className="max-w-xs bg-white p-2 shadow-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    {type === "local" 
                      ? "Les modèles locaux s'exécutent sur votre machine sans clé API" 
                      : "Les modèles cloud offrent de meilleures performances via des API"
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            onClick={() => setShowCustomForm(!showCustomForm)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Ajouter un modèle personnalisé
          </Button>
        </div>

        <ModelSelect
          models={models}
          selectedModel={selectedModel}
          onModelSelect={onModelSelect}
          type={type}
        />
      </div>

      {showCustomForm && (
        <Card className="border-purple-200 shadow-sm bg-purple-50 mt-4">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-purple-800 mb-3">Ajouter un modèle personnalisé</h3>
            <CustomModelForm 
              type={type}
              onModelAdd={(model) => {
                onModelAdd(model);
                setShowCustomForm(false);
              }}
            />
          </CardContent>
        </Card>
      )}

      {selectedModelConfig && (
        <>
          <Separator className="my-6" />
          
          <div className="space-y-6">
            <h3 className="text-base font-medium">Configuration du modèle</h3>
            
            <ModelConfigurationFields
              model={selectedModelConfig}
              onModelUpdate={onModelAdd}
            />
            
            <CustomModelFields
              model={selectedModelConfig}
              onModelUpdate={onModelAdd}
            />
          </div>
        </>
      )}
    </div>
  );
}
