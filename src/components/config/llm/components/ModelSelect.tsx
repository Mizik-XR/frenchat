
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, InfoIcon, Lock, Unlock, ExternalLink } from "lucide-react";
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
      <SelectTrigger className="w-full bg-white text-base relative border-gray-300 focus:ring-purple-500 focus:border-purple-500">
        <SelectValue placeholder="Sélectionner un modèle" />
      </SelectTrigger>
      <SelectContent className="bg-white shadow-lg border max-h-[400px] overflow-y-auto z-50">
        {models.map((model) => (
          <SelectItem 
            key={model.id} 
            value={model.id} 
            className="py-3 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-base">{model.name}</span>
                  
                  <div className="flex gap-1 flex-wrap">
                    {model.apiType && (
                      <Badge 
                        variant={model.apiType === "huggingface" ? "default" : "outline"}
                        className={model.apiType === "huggingface" 
                          ? "bg-purple-100 text-purple-800 border-purple-200" 
                          : "bg-gray-100 text-gray-800 border-gray-200"}
                      >
                        {model.apiType}
                      </Badge>
                    )}
                    
                    {model.isOpenSource ? (
                      <Badge 
                        variant="outline" 
                        className="bg-green-100 text-green-800 border-green-200 whitespace-nowrap"
                      >
                        <Unlock className="h-3 w-3 mr-1" />
                        Open Source
                      </Badge>
                    ) : (
                      <Badge 
                        variant="outline" 
                        className="bg-amber-100 text-amber-800 border-amber-200 whitespace-nowrap"
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Propriétaire
                      </Badge>
                    )}
                  </div>
                </div>
                
                {selectedModel === model.id && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </div>
              
              <span className="text-sm text-gray-600">
                {model.description}
              </span>
              
              <div className="mt-1 flex items-center">
                {type === "local" ? (
                  <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Aucune clé API requise
                  </span>
                ) : model.requiresKey ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-amber-700 font-medium">
                      Requiert une clé API
                    </span>
                    {model.docsUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3.5 w-3.5 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white p-2 shadow-lg">
                            <a 
                              href={model.docsUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Obtenir une clé API
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-blue-700 font-medium">
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
