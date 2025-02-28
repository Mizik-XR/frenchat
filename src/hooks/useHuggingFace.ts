
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useHuggingFace(provider: string = 'huggingface') {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textGeneration = async (options: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Essayer d'abord avec Supabase Functions
      try {
        const { data, error } = await supabase.functions.invoke('text-generation', {
          body: { ...options, provider }
        });

        if (error) throw error;
        setIsLoading(false);
        return data.results;
      } catch (supabaseError) {
        console.warn("Échec de l'appel à la fonction Supabase, tentative avec le serveur local", supabaseError);
        
        // Fallback au serveur local
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        
        // Préparer le système prompt si nécessaire
        const systemPrompt = options.system_prompt || 
          "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante.";
        
        const response = await fetch(`${apiUrl}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: options.inputs || options.prompt,
            max_length: options.parameters?.max_length || options.max_length || 800,
            temperature: options.parameters?.temperature || options.temperature || 0.7,
            top_p: options.parameters?.top_p || options.top_p || 0.9,
            system_prompt: systemPrompt
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
        
        const data = await response.json();
        return [{ generated_text: data.generated_text }];
      }
    } catch (e) {
      console.error("Erreur lors de l'appel au modèle:", e);
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { textGeneration, isLoading, error };
}
