
import { AIProvider, AIModelConfig, AIProviderOptions } from '@/types/chat';
import { Message } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { openAiService } from './openAiService';
import { anthropicService } from './anthropicService';
import { createChatPrompt } from '../utils/promptBuilders';

export interface AIProviderServiceType {
  generateResponse: (
    messages: Message[], 
    modelConfig: AIModelConfig,
    options?: AIProviderOptions
  ) => Promise<{
    content: string;
    usage: { total_tokens: number };
  }>;
  
  // Pour la compatibilité avec le code existant
  generateOpenAIAgentResponse: (
    content: string, 
    conversationId: string, 
    config?: any
  ) => Promise<string>;
  
  generateOpenAIResponse: (
    content: string,
    config?: any
  ) => Promise<string>;
  
  generateAnthropicResponse: (
    content: string,
    config?: any
  ) => Promise<string>;
  
  generateStandardResponse: (
    content: string,
    provider: AIProvider,
    config?: any
  ) => Promise<string>;
}

export const aiProviderService: AIProviderServiceType = {
  generateResponse: async (messages, modelConfig, options = {}) => {
    const provider = modelConfig.provider || 'openai';
    const prompt = createChatPrompt(messages);
    
    let response;
    
    switch (provider) {
      case 'openai': 
        response = await openAiService.generateMessage(JSON.stringify(prompt), {
          model: modelConfig.model,
          temperature: modelConfig.temperature,
          ...options
        });
        break;
      case 'anthropic':
        response = await anthropicService.generateMessage(JSON.stringify(prompt), {
          model: modelConfig.model,
          temperature: modelConfig.temperature,
          ...options
        });
        break;
      default:
        // Fallback pour tout autre provider
        response = {
          content: `Réponse générée par le provider ${provider}. Ce provider n'est pas encore implémenté.`,
          usage: { total_tokens: 0 }
        };
    }
    
    return response;
  },
  
  // Méthodes de compatibilité
  generateOpenAIAgentResponse: async (content, conversationId, config) => {
    const prompt = `Conversation ID: ${conversationId}\nUser: ${content}`;
    const response = await openAiService.generateMessage(prompt, config);
    return response.content;
  },
  
  generateOpenAIResponse: async (content, config) => {
    const response = await openAiService.generateMessage(content, config);
    return response.content;
  },
  
  generateAnthropicResponse: async (content, config) => {
    const response = await anthropicService.generateMessage(content, config);
    return response.content;
  },
  
  generateStandardResponse: async (content, provider, config) => {
    if (provider === 'openai') {
      return aiProviderService.generateOpenAIResponse(content, config);
    } else if (provider === 'anthropic') {
      return aiProviderService.generateAnthropicResponse(content, config);
    } else {
      return `Réponse générée par le provider ${provider}. Ce provider n'est pas encore implémenté.`;
    }
  }
};

export const useAIProviderService = () => {
  return aiProviderService;
};
