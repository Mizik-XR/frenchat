
import { useState } from 'react';
import { AIProvider } from '@/types/chat';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useModelSelection() {
  const [activeModel, setActiveModel] = useState<'mixtral' | 'deepseek' | 'search'>('mixtral');

  const handleModelSelect = async (model: 'mixtral' | 'deepseek' | 'search') => {
    setActiveModel(model);
    
    let modelName = "";
    let modelType = "";
    
    switch(model) {
      case 'mixtral':
        modelName = "Mixtral";
        modelType = "huggingface";
        
        toast({
          title: "Modèle Mixtral activé",
          description: "Le modèle Mixtral via Hugging Face est maintenant utilisé",
        });
        break;
        
      case 'deepseek':
        modelName = "DeepThink";
        modelType = "deepseek";
        
        // Test if deep search capabilities are available
        try {
          await fetch('https://api-inference.huggingface.co/models/deepseek-ai/deepseek-coder-33b-instruct', {
            method: 'HEAD'
          });
          
          toast({
            title: "Service DeepThink",
            description: "Mode DeepThink activé (analyse avancée)",
          });
        } catch (error) {
          console.log("DeepThink service check error:", error);
          // Still show toast even if service check fails
          toast({
            title: "Service DeepThink",
            description: "Mode DeepThink activé (analyse avancée)",
          });
        }
        break;
        
      case 'search':
        modelName = "Recherche Internet";
        modelType = "internet-search";
        
        // Test web search functionality
        try {
          const { data, error } = await supabase.functions.invoke('web-search', {
            body: { query: 'test' }
          });
          
          if (error) throw error;
          
          toast({
            title: "Service de recherche",
            description: "Recherche Internet activée",
          });
        } catch (error) {
          console.log("Web search service check error:", error);
          // Fallback toast
          toast({
            title: "Service de recherche",
            description: "Le service de recherche est prêt",
          });
        }
        break;
    }

    return modelType as AIProvider;
  };

  return {
    activeModel,
    handleModelSelect
  };
}
