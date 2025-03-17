import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { getAnthropicResponse } from "./anthropicService";
import { getOpenAiResponse } from "./openAiService";
import { ChatMessage } from "@/integrations/supabase/sharedTypes";
import { buildRAGPrompt } from "../utils/promptBuilders";
import { useSupabase } from "@/contexts/SupabaseContext";

interface AiServiceParams {
  prompt: string;
  selectedModel: string;
  temperature: number;
  conversationId: string;
  onNewMessage: (message: ChatMessage) => void;
  onUpdateMessage: (message: ChatMessage) => void;
  ragContext?: { context: string; source?: string; metadata?: any };
}

export const useAiProviderService = () => {
  const { toast } = useToast();
	const { supabase } = useSupabase();

  const getAIStream = async ({
    prompt,
    selectedModel,
    temperature,
    conversationId,
    onNewMessage,
    onUpdateMessage,
    ragContext
  }: AiServiceParams) => {
    try {
      if (!selectedModel) {
        throw new Error("No model selected");
      }

      if (!prompt) {
        throw new Error("No prompt provided");
      }

      let context = ragContext;
      if (!ragContext) {
        const { data: ragContext, error } = await supabase
          .from('rag_contexts')
          .select('*')
          .eq('conversation_id', conversationId)
          .single();

        if (error) {
          console.error("Error fetching RAG context:", error);
          toast({
            title: "Error fetching RAG context",
            description: "Please try again.",
            variant: "destructive",
          });
        }

        context = ragContext;
      }

      if (!context) {
        console.warn("No RAG context found, proceeding without it.");
      }

      const ragPrompt = buildRAGPrompt(context.context);

      const messageId = uuidv4();
      const initialMessage: ChatMessage = {
        id: messageId,
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
        content: "",
        role: "assistant",
        message_type: "text",
      };

      onNewMessage(initialMessage);

      const updateMessage = (content: string) => {
        const updatedMessage: ChatMessage = {
          ...initialMessage,
          content: content,
        };
        onUpdateMessage(updatedMessage);
      };

      if (selectedModel.includes("claude")) {
        await getAnthropicResponse({
          prompt: ragPrompt,
          selectedModel: selectedModel,
          temperature: temperature,
          updateMessage: updateMessage,
        });
      } else {
        await getOpenAiResponse({
          prompt: ragPrompt,
          selectedModel: selectedModel,
          temperature: temperature,
          updateMessage: updateMessage,
        });
      }
    } catch (error: any) {
      console.error("Error in AI service:", error);
      toast({
        title: "AI Provider Error",
        description: error.message || "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { getAIStream };
};
