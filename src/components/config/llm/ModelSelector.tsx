
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, PlusCircle, CheckCircle } from "lucide-react";
import type { AIModel } from "./types";
import { CustomModelForm } from "./CustomModelForm";
import { ModelSelect } from "./components/ModelSelect";
import { ModelConfigurationFields } from "./components/ModelConfigurationFields";
import { CustomModelFields } from "./components/CustomModelFields";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useState  } from '@/core/reactInstance';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <Label className="text-base font-medium text-gray-900 flex items-center gap-2">
            {label}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white p-2 z-50 shadow-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    {type === "local" 
                      ? "Les modèles locaux s'exécutent sur votre machine sans clé API" 
                      : "Les modèles cloud offrent de meilleures performances via des API"
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
        </div>

        {/* Menu déroulant plus visible et clair pour la sélection du modèle */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Select 
            value={selectedModel} 
            onValueChange={onModelSelect}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Sélectionnez un modèle" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50 max-h-56 overflow-y-auto">
              {models.map((model) => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  className="flex items-center py-3 px-4 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {selectedModel === model.id && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.description}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex justify-end mt-2">
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
        </div>
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
            
            <Card className="border-gray-200 bg-white p-4">
              <ModelConfigurationFields
                model={selectedModelConfig}
                onModelUpdate={onModelAdd}
              />
              
              <CustomModelFields
                model={selectedModelConfig}
                onModelUpdate={onModelAdd}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
