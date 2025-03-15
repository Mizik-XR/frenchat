
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAIProviders } from "./useAIProviders";
import { useHuggingFace } from "../useHuggingFace";
import { WebUIConfig, AIProvider } from "@/types/chat";
import { useSecureApiProxy } from "../useSecureApiProxy";
import { useAuth } from "@/components/AuthProvider";
import { useOpenAIAgents } from "../ai/useOpenAIAgents";

// Type pour les options d'envoi de message
export interface SendMessageOptions {
  content: string;
  conversationId: string;
  files?: File[];
  fileUrls?: string[];
  replyTo?: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
  };
  config: WebUIConfig;
}

// Hook pour gérer le traitement des messages de chat
export function useChatProcessing() {
  const { generateResponse } = useAIProviders();
  const { textGeneration } = useHuggingFace();
  const { user } = useAuth();
  const { callApi, generateText } = useSecureApiProxy();
  const { askAgentWithContext } = useOpenAIAgents();
  
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mutation pour envoyer un message et obtenir une réponse
  const {
    mutate: sendMessage,
    isLoading: isProcessing,
    isSuccess,
    data,
    reset
  } = useMutation({
    mutationFn: async ({
      content,
      conversationId,
      files = [],
      fileUrls = [],
      replyTo,
      config
    }: SendMessageOptions) => {
      try {
        setIsError(false);
        setError(null);

        // Créer un ID temporaire pour le message utilisateur
        const userMessageId = crypto.randomUUID();
        
        // Préparer les métadonnées
        const messageMetadata = {
          replyToId: replyTo?.id,
          replyToContent: replyTo?.content,
          replyToRole: replyTo?.role,
          fileIds: [],
          fileUrls: fileUrls || [],
          model: config.model || "huggingface",
          provider: config.provider || "huggingface",
        };

        // Créer le message utilisateur
        const userMessage = {
          id: userMessageId,
          role: 'user',
          content,
          conversationId,
          metadata: messageMetadata,
          timestamp: new Date()
        };

        // Sauvegarder le message dans la base de données
        const { error: saveError } = await supabase
          .from('conversation_messages')
          .insert(userMessage);

        if (saveError) throw saveError;

        let generatedText = "";

        // Vérifier si on utilise les agents OpenAI pour RAG
        if (config.provider === "openai-agent" && config.useRag) {
          // Récupérer le contexte RAG pour la conversation
          const { data: ragContext } = await supabase
            .from('rag_contexts')
            .select('context')
            .eq('conversation_id', conversationId)
            .maybeSingle();
          
          if (ragContext?.context) {
            // Utiliser l'agent OpenAI avec le contexte RAG
            const response = await askAgentWithContext(
              ragContext.context,
              content,
              {
                modelName: config.model || "gpt-4o",
                instructions: `Tu es un assistant qui répond aux questions en utilisant uniquement le contexte fourni. 
                Si la réponse ne peut pas être déterminée à partir du contexte, dis-le clairement.`
              }
            );
            
            if (response) {
              generatedText = response;
            }
          }
        } else if (config.provider === "openai") {
          // Utiliser l'API OpenAI via le proxy sécurisé
          generatedText = await generateText(content, {
            model: config.model || "gpt-4o-mini",
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            system_prompt: `Tu es un assistant d'IA qui répond aux questions de manière concise et précise. 
            Mode d'analyse: ${config.analysisMode}`
          });
        } else if (config.provider === "anthropic") {
          // Utiliser l'API Anthropic via le proxy sécurisé
          const response = await callApi('anthropic', 'messages', {
            model: config.model || "claude-3-haiku-20240307",
            max_tokens: config.maxTokens || 1000,
            temperature: config.temperature || 0.7,
            system: `Tu es un assistant d'IA qui répond aux questions de manière utile, précise et honnête. Mode d'analyse: ${config.analysisMode}`,
            messages: [
              { role: "user", content: content }
            ]
          });
          
          generatedText = response.content?.[0]?.text || "";
        } else {
          // Utiliser la génération standard via les fournisseurs configurés
          const results = await generateResponse(
            content,
            content,
            config.provider || "huggingface",
            config
          );
          
          if (results && results.length > 0) {
            generatedText = results[0].generated_text || "";
          }
        }

        // Créer un ID pour le message assistant
        const assistantMessageId = crypto.randomUUID();

        // Créer le message assistant
        const assistantMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: generatedText,
          conversationId,
          metadata: {
            replyToId: userMessageId,
            model: config.model || "huggingface",
            provider: config.provider || "huggingface",
          },
          timestamp: new Date()
        };

        // Sauvegarder le message assistant dans la base de données
        const { error: assistantSaveError } = await supabase
          .from('conversation_messages')
          .insert(assistantMessage);

        if (assistantSaveError) throw assistantSaveError;

        return {
          userMessage,
          assistantMessage
        };
      } catch (err) {
        console.error("Error processing message:", err);
        setIsError(true);
        setError(err as Error);
        throw err;
      }
    }
  });

  return {
    sendMessage,
    isProcessing,
    isSuccess,
    isError,
    error,
    data,
    reset
  };
}
