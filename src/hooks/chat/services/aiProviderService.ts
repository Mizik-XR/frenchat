
import { supabase } from '@/integrations/supabase/client';
import { prepareMessagesForAI, cacheResponse } from '../utils/responseHandlers';
import { anthropicService } from './anthropicService';
import { openAiService } from './openAiService';
import { Message } from '../utils/responseHandlers';
import { createChatPrompt } from '../utils/promptBuilders';
import SupabaseContext from '@/contexts/SupabaseContext';

// Types
export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProviderOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  cacheResults?: boolean;
  metadata?: any;
}

// Service principal pour l'IA
export const useAiProviderService = () => {
  const generateResponse = async (
    messages: Message[],
    modelConfig: AIModelConfig,
    options: AIProviderOptions = {}
  ) => {
    try {
      // Préparer les messages pour l'IA
      const formattedMessages = prepareMessagesForAI(messages);
      
      // Créer le prompt complet
      const prompt = createChatPrompt(formattedMessages, options.systemPrompt);
      
      let content = '';
      let usage = { total_tokens: 0 };
      
      // Sélectionner le service approprié en fonction du fournisseur
      switch (modelConfig.provider.toLowerCase()) {
        case 'anthropic':
          const anthropicResponse = await anthropicService.generateMessage(
            JSON.stringify(prompt),
            {
              temperature: options.temperature || modelConfig.temperature || 0.7,
              maxTokens: options.maxTokens || modelConfig.maxTokens || 1000
            }
          );
          content = anthropicResponse.content;
          usage = anthropicResponse.usage;
          break;
          
        case 'openai':
          const openaiResponse = await openAiService.generateMessage(
            JSON.stringify(prompt),
            {
              temperature: options.temperature || modelConfig.temperature || 0.7,
              maxTokens: options.maxTokens || modelConfig.maxTokens || 1000
            }
          );
          content = openaiResponse.content;
          usage = openaiResponse.usage;
          break;
          
        default:
          content = "Je ne suis pas configuré pour ce fournisseur d'IA.";
      }
      
      // Mettre en cache la réponse si demandé
      if (options.cacheResults !== false) {
        await cacheResponse(
          JSON.stringify(prompt),
          content,
          modelConfig.id
        );
      }
      
      return {
        content,
        usage
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  };
  
  return {
    generateResponse
  };
};

// Pour compatibilité avec d'autres modules
export const useAIProviderService = useAiProviderService;
