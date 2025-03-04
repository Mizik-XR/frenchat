
import { useState } from 'react';
import { AIProvider } from '@/types/chat';
import { toast } from "@/hooks/use-toast";

export function useModelSelection() {
  const [activeModel, setActiveModel] = useState<'mixtral' | 'deepseek' | 'search'>('mixtral');

  const handleModelSelect = (model: 'mixtral' | 'deepseek' | 'search') => {
    setActiveModel(model);
    
    let modelName = "";
    let modelType = "";
    
    switch(model) {
      case 'mixtral':
        modelName = "Mixtral";
        modelType = "huggingface";
        break;
      case 'deepseek':
        modelName = "DeepSeek";
        modelType = "deepseek";
        break;
      case 'search':
        modelName = "Recherche Internet";
        modelType = "internet-search";
        break;
    }
    
    toast({
      title: "Modèle sélectionné",
      description: `Vous utilisez maintenant ${modelName}`,
    });

    return modelType as AIProvider;
  };

  return {
    activeModel,
    handleModelSelect
  };
}
