
import { useState, useEffect, useLayoutEffect } from 'react';
import { AIProvider } from '@/types/chat';

// Hook sécurisé pour useLayoutEffect qui bascule vers useEffect côté serveur
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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

  // Initialisation sécurisée côté client
  useIsomorphicLayoutEffect(() => {
    // Code d'initialisation au montage du composant
    console.log("Model selection initialized with:", selectedModel);
    
    return () => {
      // Cleanup code au démontage du composant
      console.log("Model selection cleanup");
    };
  }, []);

  return {
    selectedModel,
    setSelectedModel,
    activeModel,
    handleModelSelect
  };
}
