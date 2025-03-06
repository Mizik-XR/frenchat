
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  modelSource: 'cloud' | 'local';
}

export function ModelSelector({ selectedModel, onSelectModel, modelSource }: ModelSelectorProps) {
  const cloudModels = [
    { id: "huggingface", name: "Hugging Face" },
    { id: "internet-search", name: "Recherche Internet" },
    { id: "deepseek", name: "DeepThink" },
  ];

  const localModels = [
    { id: "mistral", name: "Mistral 7B" },
    { id: "ollama", name: "Ollama" },
  ];

  const models = modelSource === 'cloud' ? cloudModels : localModels;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          Modèle: {models.find((m) => m.id === selectedModel)?.name || selectedModel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            className="flex items-center justify-between"
          >
            <span>{model.name}</span>
            {selectedModel === model.id && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
