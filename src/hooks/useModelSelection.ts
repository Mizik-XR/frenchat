
import { useState, useEffect } from 'react';
import { AIProvider } from '@/types/chat';

export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<string>("mistral-7b");
  const [activeModel, setActiveModel] = useState<"search" | "deepseek" | "mixtral">("mixtral");

  // Fonction pour gérer la sélection de modèle
  const handleModelSelect = async (model: "search" | "deepseek" | "mixtral"): Promise<AIProvider> => {
    setActiveModel(model);
    
    // Mettre à jour le selectedModel en fonction du activeModel
    let newModel = "mistral-7b";
    if (model === "search") newModel = "internet-search";
    else if (model === "deepseek") newModel = "deepseek";
    else if (model === "mixtral") newModel = "huggingface";
    
    setSelectedModel(newModel);
    
    return model as unknown as AIProvider;
  };

  return {
    selectedModel,
    setSelectedModel,
    activeModel,
    handleModelSelect
  };
}
