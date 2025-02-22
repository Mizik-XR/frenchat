
import { supabase } from "@/integrations/supabase/client";

export function useHuggingFace(provider: string = 'huggingface') {
  const textGeneration = async (options: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-generation', {
        body: { ...options }
      });

      if (error) throw error;
      return data.results;
    } catch (error) {
      console.error("Erreur lors de l'appel à Hugging Face:", error);
      throw error;
    }
  };

  return { textGeneration };
}
