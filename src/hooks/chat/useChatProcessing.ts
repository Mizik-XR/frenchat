
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAIProviderService } from "./services/aiProviderService";
import { useMessageService } from "./services/messageService";
import { SendMessageOptions, MessageResult } from "./types";
import { useAuth } from "@/components/AuthProvider";

// Hook pour gérer le traitement des messages de chat
export function useChatProcessing() {
  const { user } = useAuth();
  const aiProviderService = useAIProviderService();
  const messageService = useMessageService();
  
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

        // Créer et sauvegarder le message utilisateur
        const userMessage = messageService.createUserMessage(
          content, 
          conversationId, 
          files, 
          fileUrls, 
          replyTo, 
          config
        );
        
        await messageService.saveMessageToDatabase(userMessage);

        // Générer la réponse selon le provider choisi
        let generatedText = "";

        if (config.provider === 'openai-agent' && config.useRag) {
          generatedText = await aiProviderService.generateOpenAIAgentResponse(content, conversationId, config);
        } else if (config.provider === 'openai') {
          generatedText = await aiProviderService.generateOpenAIResponse(content, config);
        } else if (config.provider === 'anthropic') {
          generatedText = await aiProviderService.generateAnthropicResponse(content, config);
        } else {
          generatedText = await aiProviderService.generateStandardResponse(content, config.provider, config);
        }

        // Créer et sauvegarder le message assistant
        const assistantMessage = messageService.createAssistantMessage(
          generatedText, 
          conversationId, 
          userMessage.id, 
          config
        );
        
        await messageService.saveMessageToDatabase(assistantMessage);

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
    sendMessage: mutation.mutate,
    isProcessing: mutation.isPending,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError,
    error,
    data: mutation.data,
    reset: mutation.reset
  };
}
