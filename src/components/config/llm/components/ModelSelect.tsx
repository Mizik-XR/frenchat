
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import type { AIModel } from "../types";

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
      <SelectContent className="bg-white shadow-lg border max-h-[400px] overflow-y-auto">
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id} className="py-3 hover:bg-gray-50">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-base">{model.name}</span>
                {selectedModel === model.id && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
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
  );
}
