
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { WebUIConfig, Message } from "@/types/chat";
import { chatService } from "@/services/chatService";
import { useAIProviders } from "./useAIProviders";
import { useMessageReply } from "./useMessageReply";

export function useChatProcessing(selectedConversationId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    generateResponse, 
    serviceType, 
    localAIUrl,
    getSystemPrompt 
  } = useAIProviders();
  
  const {
    replyToMessage,
    handleReplyToMessage,
    clearReplyToMessage,
    buildReplyPrompt
  } = useMessageReply();

  useEffect(() => {
    // Notification à l'utilisateur sur le type de service utilisé
    if (serviceType === 'local' && localAIUrl) {
      toast({
        title: "Service IA local détecté",
        description: "Utilisation du modèle IA local pour de meilleures performances",
      });
    } else if (serviceType === 'hybrid') {
      toast({
        title: "Mode automatique activé",
        description: "L'IA alternera intelligemment entre modèles locaux et cloud selon vos requêtes",
      });
    }
  }, [serviceType, localAIUrl]);

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
      clearReplyToMessage();

      let prompt = message;
      if (webUIConfig.useMemory && conversationContext) {
        prompt = `Contexte précédent:\n${conversationContext}\n\nNouvelle question: ${message}`;
      }

      // Si on répond à un message, ajouter le contexte
      prompt = buildReplyPrompt(message, replyToMessage);

      // Ajout d'information sur le type de service IA utilisé dans les métadonnées
      const aiServiceInfo = {
        type: serviceType as 'local' | 'cloud' | 'hybrid',
        endpoint: serviceType === 'local' ? localAIUrl : 'cloud',
        actualServiceUsed: serviceType as 'local' | 'cloud'
      };

      const response = await generateResponse(
        message, 
        prompt, 
        webUIConfig.model, 
        webUIConfig
      );

      // Mise à jour du type de service potentiellement choisi automatiquement
      const serviceUsed = localStorage.getItem('lastServiceUsed') || serviceType;

      // Create a type-safe metadata object
      const metadata = { 
        provider: webUIConfig.model,
        analysisMode: webUIConfig.analysisMode,
        aiService: {
          ...aiServiceInfo,
          actualServiceUsed: serviceUsed as 'local' | 'cloud'
        }
      };

      await chatService.sendAssistantMessage(
        response[0].generated_text,
        selectedConversationId,
        'text',
        documentId,
        metadata
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
    replyToMessage,
    processMessage,
    handleReplyToMessage,
    clearReplyToMessage,
    serviceType,
    localAIUrl
  };
}
