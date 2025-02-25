
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { chatService } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { AIProvider, WebUIConfig } from "@/types/chat";

export function useChatLogic(selectedConversationId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const { textGeneration } = useHuggingFace();

  const getSystemPrompt = (mode: string) => {
    switch (mode) {
      case 'analysis':
        return `Tu es un assistant analytique qui fournit des réponses détaillées et approfondies. 
                Analyse en profondeur tous les aspects de la question.`;
      case 'summary':
        return `Tu es un assistant concis qui fournit des résumés clairs et synthétiques. 
                Va droit à l'essentiel en quelques points clés.`;
      case 'action':
        return `Tu es un assistant orienté action qui fournit des étapes concrètes et pratiques. 
                Structure ta réponse en étapes numérotées.`;
      default:
        return `Tu es un assistant polyvalent qui aide les utilisateurs en s'adaptant à leurs besoins.`;
    }
  };

  const processMessage = async (
    message: string,
    webUIConfig: WebUIConfig,
    documentId: string | null,
    conversationContext?: string
  ) => {
    if (!selectedConversationId) {
      throw new Error("No conversation selected");
    }

    setIsLoading(true);

    try {
      await chatService.sendUserMessage(message, selectedConversationId);

      let prompt = message;
      if (webUIConfig.useMemory && conversationContext) {
        prompt = `Contexte précédent:\n${conversationContext}\n\nNouvelle question: ${message}`;
      }

      let response;
      switch (webUIConfig.model) {
        case 'huggingface':
          response = await textGeneration({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            inputs: `[INST] ${getSystemPrompt(webUIConfig.analysisMode)}\n\n${prompt} [/INST]`,
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
            inputs: prompt,
            parameters: {
              max_length: webUIConfig.maxTokens,
              temperature: webUIConfig.temperature
            }
          });
      }

      await chatService.sendAssistantMessage(
        response[0].generated_text,
        selectedConversationId,
        'text',
        { 
          provider: webUIConfig.model,
          analysisMode: webUIConfig.analysisMode
        }
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
