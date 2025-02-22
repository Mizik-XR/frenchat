
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { chatService } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { AIProvider, WebUIConfig } from "@/types/chat";

export function useChatLogic(selectedConversationId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const { textGeneration } = useHuggingFace();

  const determineProvider = async (message: string, mode: 'auto' | 'manual', model: AIProvider) => {
    if (mode === 'manual') {
      return model;
    }

    if (message.startsWith('🔍')) {
      return 'internet-search';
    }

    if (message.startsWith('🧠')) {
      return 'deepthink';
    }

    if (message.toLowerCase().includes('génère une image') || 
        message.toLowerCase().includes('créer une image') ||
        message.toLowerCase().includes('visualiser')) {
      return 'stable-diffusion';
    }

    return 'huggingface';
  };

  const generateImage = async (prompt: string, documentId: string | null, model: AIProvider) => {
    const { data: { data: imageData }, error } = await supabase.functions.invoke('generate-image', {
      body: { prompt, documentId, model }
    });

    if (error) throw error;

    if (selectedConversationId) {
      await chatService.sendAssistantMessage(
        "Voici l'image générée selon votre demande :",
        selectedConversationId,
        'image',
        { imageUrl: imageData.image_url }
      );
    }

    return imageData.image_url;
  };

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
      
      const provider = await determineProvider(message, webUIConfig.mode, webUIConfig.model);
      
      if (provider === 'stable-diffusion') {
        const imageUrl = await generateImage(message, documentId, webUIConfig.model);
        return {
          content: "Voici l'image générée selon votre demande :",
          metadata: { imageUrl }
        };
      } 
      else if (provider === 'internet-search') {
        const searchQuery = message.replace('🔍', '').trim();
        const { data: searchData, error } = await supabase.functions.invoke('web-search', {
          body: { query: searchQuery }
        });

        if (error) throw error;

        await chatService.sendAssistantMessage(
          searchData.result,
          selectedConversationId
        );

        return { content: searchData.result };
      }
      else if (provider === 'deepthink') {
        const deepthinkQuery = message.replace('🧠', '').trim();
        const response = await textGeneration({
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          inputs: `[INST] Analysez en profondeur et avec un esprit critique : ${deepthinkQuery} [/INST]`,
          parameters: {
            max_length: 2000,
            temperature: 0.3,
            top_p: 0.95,
          }
        });

        await chatService.sendAssistantMessage(
          response[0].generated_text,
          selectedConversationId
        );

        return { content: response[0].generated_text };
      }
      else {
        const prompt = `[INST] ${message} [/INST]`;
        const response = await textGeneration({
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          inputs: prompt,
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
      }
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
