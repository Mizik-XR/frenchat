
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, InfoIcon, Lock, Unlock } from "lucide-react";
import type { AIModel } from "../types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ModelSelectProps {
  models: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  type: "local" | "cloud";
}

export function ModelSelect({ models, selectedModel, onModelSelect, type }: ModelSelectProps) {
  return (
    <Select
      value={selectedModel}
      onValueChange={onModelSelect}
    >
      <SelectTrigger className="w-full bg-white text-base">
        <SelectValue placeholder="Sélectionner un modèle" />
      </SelectTrigger>
      <SelectContent className="bg-white shadow-lg border max-h-[400px] overflow-y-auto z-50">
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id} className="py-3 hover:bg-gray-50">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base">{model.name}</span>
                  {model.apiType && (
                    <Badge className="ml-1" variant={model.apiType === "huggingface" ? "default" : "outline"}>
                      {model.apiType}
                    </Badge>
                  )}
                  {model.isOpenSource ? (
                    <Badge className="ml-1" variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      <Unlock className="h-3 w-3 mr-1" />
                      Open Source
                    </Badge>
                  ) : (
                    <Badge className="ml-1" variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                      <Lock className="h-3 w-3 mr-1" />
                      Propriétaire
                    </Badge>
                  )}
                </div>
                {selectedModel === model.id && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
              <span className="text-sm text-gray-500">
                {model.description}
              </span>
              <div className="mt-1 flex items-center">
                {type === "local" ? (
                  <span className="text-sm text-green-600 font-medium">
                    Aucune clé API requise
                  </span>
                ) : model.requiresKey ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-amber-600 font-medium">
                      Requiert une clé API
                    </span>
                    {model.docsUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white p-2 shadow-lg">
                            <a href={model.docsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              Obtenir une clé API
                            </a>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-blue-600 font-medium">
                    Clé API optionnelle
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
