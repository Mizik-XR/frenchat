
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { chatService } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { AIProvider, WebUIConfig, Message } from "@/types/chat";

export function useChatLogic(selectedConversationId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const { 
    textGeneration, 
    serviceType, 
    localAIUrl 
  } = useHuggingFace();

  useEffect(() => {
    // Notification à l'utilisateur sur le type de service utilisé
    if (serviceType === 'local' && localAIUrl) {
      toast({
        title: "Service IA local détecté",
        description: "Utilisation du modèle IA local pour de meilleures performances",
      });
    }
  }, [serviceType, localAIUrl]);

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
      // Préparer les métadonnées si on répond à un message
      const replyMetadata = replyToMessage ? {
        replyTo: {
          id: replyToMessage.id,
          content: replyToMessage.content,
          role: replyToMessage.role
        }
      } : undefined;

      // Envoyer le message utilisateur
      await chatService.sendUserMessage(
        message, 
        selectedConversationId, 
        'text', 
        documentId, 
        replyMetadata
      );

      // Réinitialiser le message auquel on répond
      setReplyToMessage(null);

      let prompt = message;
      if (webUIConfig.useMemory && conversationContext) {
        prompt = `Contexte précédent:\n${conversationContext}\n\nNouvelle question: ${message}`;
      }

      // Si on répond à un message, ajouter le contexte
      if (replyToMessage) {
        prompt = `Tu réponds au message suivant: "${replyToMessage.content}"\n\nLa nouvelle question/commentaire est: "${message}"`;
      }

      // Ajout d'information sur le type de service IA utilisé dans les métadonnées
      const aiServiceInfo = {
        type: serviceType === 'hybrid' ? 'cloud' : serviceType,
        endpoint: serviceType === 'local' ? localAIUrl : 'cloud'
      };

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
        documentId,
        { 
          provider: webUIConfig.model,
          analysisMode: webUIConfig.analysisMode,
          aiService: aiServiceInfo
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

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
    toast({
      title: "Réponse",
      description: "Vous répondez à un message spécifique",
    });
  };

  return {
    isLoading,
    replyToMessage,
    processMessage,
    handleReplyToMessage,
    clearReplyToMessage: () => setReplyToMessage(null),
    serviceType,
    localAIUrl
  };
}
