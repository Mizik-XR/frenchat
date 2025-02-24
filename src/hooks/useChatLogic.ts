
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { chatService } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { AIProvider, WebUIConfig } from "@/types/chat";

export function useChatLogic(selectedConversationId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const { textGeneration } = useHuggingFace();

  const processMessage = async (
    message: string,
    webUIConfig: WebUIConfig,
    documentId: string | null
  ) => {
    if (!selectedConversationId) {
      throw new Error("No conversation selected");
    }

    setIsLoading(true);

    try {
      // Envoyer le message de l'utilisateur
      await chatService.sendUserMessage(message, selectedConversationId);

      // Sélectionner le modèle en fonction de la configuration
      let response;
      switch (webUIConfig.model) {
        case 'huggingface':
          response = await textGeneration({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            inputs: `[INST] ${message} [/INST]`,
            parameters: {
              max_length: webUIConfig.maxTokens,
              temperature: webUIConfig.temperature,
              top_p: 0.95,
            }
          });
          break;

        case 'internet-search':
          const { data: searchData, error: searchError } = await supabase.functions.invoke('web-search', {
            body: { query: message }
          });
          if (searchError) throw searchError;
          response = [{ generated_text: searchData.results }];
          break;

        default:
          response = await textGeneration({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            inputs: message,
            parameters: {
              max_length: webUIConfig.maxTokens,
              temperature: webUIConfig.temperature
            }
          });
      }

      // Envoyer la réponse de l'assistant
      await chatService.sendAssistantMessage(
        response[0].generated_text,
        selectedConversationId,
        'text',
        { provider: webUIConfig.model }
      );

      return { content: response[0].generated_text };
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processMessage
  };
}
