
import { useState, useCallback } from 'react';
import { useSecureApiProxy } from './useSecureApiProxy';

// Types pour les requêtes/réponses OpenAI
interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  functions?: any[];
  function_call?: 'auto' | 'none' | { name: string };
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: {
    message: ChatCompletionMessage;
    finish_reason: string;
    index: number;
  }[];
}

/**
 * Hook pour utiliser l'API OpenAI de façon sécurisée (sans exposer la clé API)
 */
export const useSecureOpenAI = () => {
  const { callApi, checkServiceConfig, isLoading, error } = useSecureApiProxy();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  /**
   * Vérifie si OpenAI est configuré
   */
  const checkConfig = useCallback(async () => {
    const isConfig = await checkServiceConfig('openai');
    setIsConfigured(isConfig);
    return isConfig;
  }, [checkServiceConfig]);

  /**
   * Crée un chat completion via l'API OpenAI
   */
  const createChatCompletion = useCallback(async (
    params: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> => {
    // Si le statut de configuration n'est pas encore vérifié, le faire
    if (isConfigured === null) {
      const isConfig = await checkConfig();
      if (!isConfig) {
        throw new Error("OpenAI n'est pas configuré. Veuillez configurer une clé API dans les paramètres.");
      }
    }

    return callApi<ChatCompletionResponse>(
      'openai',
      'chat/completions',
      params
    );
  }, [callApi, checkConfig, isConfigured]);

  return {
    createChatCompletion,
    checkConfig,
    isConfigured,
    isLoading,
    error
  };
};
