
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
        <Input 
          placeholder="ID du modèle Hugging Face (ex: facebook/opt-350m)"
          className="mt-2"
          onChange={(e) => {
            onModelAdd({
              ...selectedModelConfig,
              modelId: e.target.value
            });
          }}
        />
      )}

      <CustomModelForm 
        type={type}
        onModelAdd={onModelAdd}
      />
    </div>
  );
}
