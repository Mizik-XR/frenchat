
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSecureApiProxy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const callApi = async <T>(service: string, endpoint: string, payload?: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await supabase.functions.invoke('secure-api-proxy', {
        body: {
          service,
          endpoint,
          payload,
          method
        }
      });

      if (apiError) throw apiError;
      return data as T;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkServiceConfig = async (service: string): Promise<boolean> => {
    try {
      const { data } = await supabase.functions.invoke('manage-service-config', {
        body: { action: 'check', service }
      });
      
      return data?.isConfigured || false;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  /**
   * Génère du texte via l'API OpenAI en utilisant le proxy sécurisé
   */
  const generateText = async (prompt: string, options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
  }): Promise<string> => {
    const defaultModel = 'gpt-4o-mini';
    const defaultSystemPrompt = "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante.";
    
    try {
      const response = await callApi<{ choices: Array<{ message: { content: string } }> }>('openai', 'chat/completions', {
        model: options?.model || defaultModel,
        messages: [
          { role: 'system', content: options?.system_prompt || defaultSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 500
      });
      
      return response.choices[0].message.content;
    } catch (err: any) {
      console.error("Erreur lors de la génération de texte:", err);
      throw new Error(`Erreur lors de la génération de texte: ${err.message}`);
    }
  };

  return {
    callApi,
    checkServiceConfig,
    generateText,
    isLoading,
    error
  };
};
