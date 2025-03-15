
import { useAIProviders } from "../useAIProviders";
import { useHuggingFace } from "../../useHuggingFace";
import { useSecureApiProxy } from "../../useSecureApiProxy";
import { useOpenAIAgents } from "../../ai/useOpenAIAgents";
import { WebUIConfig, AIProvider } from "@/types/chat";
import { fetchRagContext, extractAnthropicResponse } from "../utils/responseHandlers";
import { saveMessageToDatabase } from "../utils/responseHandlers";
import { SendMessageOptions } from "../types";

/**
 * Service for generating AI responses using different providers
 */
export const useAIProviderService = () => {
  const { generateResponse } = useAIProviders();
  const { textGeneration } = useHuggingFace();
  const { callApi, generateText } = useSecureApiProxy();
  const { askAgentWithContext } = useOpenAIAgents();

  /**
   * Generate a response using OpenAI Agent with RAG
   */
  const generateOpenAIAgentResponse = async (
    content: string, 
    conversationId: string,
    config: WebUIConfig
  ) => {
    const ragContext = await fetchRagContext(conversationId);
    
    if (ragContext) {
      const response = await askAgentWithContext(
        ragContext,
        content,
        {
          modelName: config.model || "gpt-4o",
          instructions: `Tu es un assistant qui répond aux questions en utilisant uniquement le contexte fourni. 
          Si la réponse ne peut pas être déterminée à partir du contexte, dis-le clairement.`
        }
      );
      
      if (response) {
        return response;
      }
    }
    
    throw new Error("Contexte RAG non disponible ou erreur de génération");
  };

  /**
   * Generate a response using OpenAI API
   */
  const generateOpenAIResponse = async (content: string, config: WebUIConfig) => {
    return await generateText(content, {
      model: config.model || "gpt-4o-mini",
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      system_prompt: `Tu es un assistant d'IA qui répond aux questions de manière concise et précise. 
      Mode d'analyse: ${config.analysisMode}`
    });
  };

  /**
   * Generate a response using Anthropic API
   */
  const generateAnthropicResponse = async (content: string, config: WebUIConfig) => {
    const response = await callApi('anthropic', 'messages', {
      model: config.model || "claude-3-haiku-20240307",
      max_tokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
      system: `Tu es un assistant d'IA qui répond aux questions de manière utile, précise et honnête. Mode d'analyse: ${config.analysisMode}`,
      messages: [
        { role: "user", content: content }
      ]
    });
    
    return extractAnthropicResponse(response);
  };

  /**
   * Generate a response using standard providers (Huggingface, etc.)
   */
  const generateStandardResponse = async (content: string, provider: AIProvider, config: WebUIConfig) => {
    const results = await generateResponse(
      content,
      content,
      provider,
      config
    );
    
    if (results && results.length > 0) {
      return results[0].generated_text || "";
    }
    
    throw new Error("Erreur lors de la génération de texte");
  };

  return {
    generateOpenAIAgentResponse,
    generateOpenAIResponse,
    generateAnthropicResponse,
    generateStandardResponse
  };
};
