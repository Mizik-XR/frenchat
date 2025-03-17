
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAIProviderService } from "./services/aiProviderService";
import { messageService } from "./services/messageService";
import { SendMessageOptions, MessageResult } from "./types";
import { useAuth } from "@/components/AuthProvider";
import { AIProvider } from "@/types/chat";

// Hook pour gérer le traitement des messages de chat
export function useChatProcessing() {
  const { user } = useAuth();
  const aiProviderService = useAIProviderService();
  
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mutation pour envoyer un message et obtenir une réponse
  const mutation = useMutation({
    mutationFn: async ({
      content,
      conversationId,
      files = [],
      fileUrls = [],
      replyTo,
      config
    }: SendMessageOptions): Promise<MessageResult> => {
      try {
        setIsError(false);
        setError(null);

        // Vérifier que l'utilisateur est connecté
        if (!user && !(config?.allowAnonymous === true)) {
          throw new Error("Vous devez être connecté pour envoyer des messages");
        }

        // Créer et sauvegarder le message utilisateur
        const userMessage = messageService.createUserMessage(
          content, 
          conversationId, 
          files, 
          fileUrls, 
          replyTo, 
          config
        );
        
        // Sauvegarder en base de données si l'utilisateur est connecté
        if (user) {
          await messageService.saveMessageToDatabase({
            id: userMessage.id,
            role: userMessage.role,
            content: userMessage.content,
            conversation_id: userMessage.conversationId,
            metadata: userMessage.metadata,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
        }

        // Générer la réponse selon le provider choisi
        let generatedText = "";
        let modelProvider = config?.provider as AIProvider || 'mistral';

        if (modelProvider === 'openai-agent' && config?.useRag) {
          // Utiliser la fonction compatibilité
          generatedText = await aiProviderService.generateOpenAIAgentResponse(content, conversationId, config);
        } else if (modelProvider === 'openai') {
          // Utiliser la fonction compatibilité
          generatedText = await aiProviderService.generateOpenAIResponse(content, config);
        } else if (modelProvider === 'anthropic') {
          // Utiliser la fonction compatibilité
          generatedText = await aiProviderService.generateAnthropicResponse(content, config);
        } else {
          // Utiliser la fonction compatibilité
          generatedText = await aiProviderService.generateStandardResponse(
            content, 
            modelProvider,
            config
          );
        }

        // Créer le message assistant
        const assistantMessage = messageService.createAssistantMessage(
          generatedText, 
          conversationId, 
          userMessage.id, 
          config
        );
        
        // Sauvegarder en base de données si l'utilisateur est connecté
        if (user) {
          await messageService.saveMessageToDatabase({
            id: assistantMessage.id,
            role: assistantMessage.role,
            content: assistantMessage.content,
            conversation_id: assistantMessage.conversationId,
            metadata: assistantMessage.metadata,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
        }

        return {
          userMessage,
          assistantMessage
        };
      } catch (err) {
        console.error("Error processing message:", err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    }
  });

  return {
    sendMessage: mutation.mutate,
    sendMessageAsync: mutation.mutateAsync,
    isProcessing: mutation.isPending,
    isLoading: mutation.isPending, 
    isSuccess: mutation.isSuccess,
    isError,
    error,
    data: mutation.data,
    reset: mutation.reset
  };
}
