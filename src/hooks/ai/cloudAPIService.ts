
import { TextGenerationParameters, TextGenerationResponse } from './types';
import { supabase } from "@/integrations/supabase/client";

/**
 * Service pour les appels à l'API cloud via Supabase Functions
 */
export const callCloudAPIService = async (
  options: TextGenerationParameters, 
  provider: string = 'huggingface'
): Promise<TextGenerationResponse[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('text-generation', {
      body: { ...options, provider }
    });

    if (error) throw error;
    return data.results;
  } catch (supabaseError) {
    console.warn("Échec de l'appel à la fonction Supabase, tentative avec le serveur cloud de secours", supabaseError);
    
    // Fallback à un serveur cloud de secours
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.filechat.app';
    
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
};
