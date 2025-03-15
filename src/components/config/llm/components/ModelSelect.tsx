
import { useState } from "react";
import { Check, InfoIcon, ServerIcon, CloudIcon } from "lucide-react";
import type { AIModel } from "../types";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ModelSelectProps {
  models: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  type: "local" | "cloud";
}

export function ModelSelect({
  models,
  selectedModel,
  onModelSelect,
  type
}: ModelSelectProps) {
  const isLocalType = type === "local";
  
  const getTypeDescription = () => {
    if (isLocalType) {
      return "Confidentialité totale, vos données restent sur votre ordinateur";
    } else {
      return "Puissance maximale, idéal pour les tâches complexes";
    }
  };
  
  const getTypeIcon = () => {
    if (isLocalType) {
      return <ServerIcon className="h-4 w-4 text-green-600 mr-1" />;
    } else {
      return <CloudIcon className="h-4 w-4 text-blue-600 mr-1" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 mb-1">
        {getTypeIcon()}
        <div className="text-sm font-semibold">
          Modèles {isLocalType ? "locaux" : "cloud"}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-3.5 w-3.5 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">{getTypeDescription()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <RadioGroup
        value={selectedModel}
        onValueChange={onModelSelect}
        className="grid gap-3 md:grid-cols-2"
      >
        {models.map((model) => {
          const isLocal = type === "local";
          const isSelected = selectedModel === model.id;
          
          return (
            <div
              key={model.id}
              className={cn(
                "relative flex cursor-pointer rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-offset-2",
                isSelected 
                  ? isLocal 
                    ? "border-green-600 bg-green-50" 
                    : "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:bg-gray-50",
                "shadow-sm"
              )}
              onClick={() => onModelSelect(model.id)}
            >
              <RadioGroupItem
                value={model.id}
                id={model.id}
                className="absolute right-3 top-3"
              />
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={model.id}
                    className={cn(
                      "font-medium text-base cursor-pointer",
                      isSelected 
                        ? isLocal 
                          ? "text-green-800" 
                          : "text-blue-800"
                        : "text-gray-700"
                    )}
                  >
                    {model.name}
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  {model.description}
                </p>
                
                {model.requiresKey && (
                  <div className="flex items-center text-xs text-amber-600 mt-1">
                    <InfoIcon className="h-3 w-3 mr-1" />
                    Nécessite une clé API
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
