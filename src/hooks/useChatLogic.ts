
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
      await chatService.sendUserMessage(message, selectedConversationId);

      const response = await textGeneration({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        inputs: `[INST] ${message} [/INST]`,
        parameters: {
          max_length: webUIConfig.maxTokens,
          temperature: webUIConfig.temperature,
          top_p: 0.95,
        }
      });

      await chatService.sendAssistantMessage(
        response[0].generated_text,
        selectedConversationId
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
