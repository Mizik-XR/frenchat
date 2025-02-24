
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AIModel } from "./types";

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  label: string;
}

export function ModelSelector({ models, selectedModel, onModelSelect, label }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <Select
        value={selectedModel}
        onValueChange={onModelSelect}
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Sélectionner un modèle" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col">
                <span className="font-medium">{model.name}</span>
                <span className="text-sm text-gray-500">
                  {model.description}
                </span>
                {model.requiresKey && (
                  <span className="text-xs text-amber-600 mt-1">
                    Requiert une clé API
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
