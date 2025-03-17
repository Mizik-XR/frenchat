
import { saveMessageToDatabase } from "../utils/responseHandlers";
import { SendMessageOptions } from "../types";
import { WebUIConfig } from "@/types/chat";

/**
 * Service for creating and formatting messages
 */
export const useMessageService = () => {
  /**
   * Create a user message with metadata
   */
  const createUserMessage = (
    content: string,
    conversationId: string,
    files: File[] = [],
    fileUrls: string[] = [],
    replyTo?: { id: string; content: string; role: 'user' | 'assistant' },
    config?: WebUIConfig
  ) => {
    const userMessageId = crypto.randomUUID();
    
    // Préparer les métadonnées
    const messageMetadata = {
      replyToId: replyTo?.id,
      replyToContent: replyTo?.content,
      replyToRole: replyTo?.role,
      fileIds: [],
      fileUrls: fileUrls || [],
      model: config?.model || "huggingface",
      provider: config?.provider || "huggingface",
    };

    // Créer le message utilisateur
    return {
      id: userMessageId,
      role: 'user',
      content,
      conversationId,
      metadata: messageMetadata,
      timestamp: new Date()
    };
  };

  /**
   * Create an assistant message with metadata
   */
  const createAssistantMessage = (
    content: string,
    conversationId: string,
    replyToId: string,
    config?: WebUIConfig
  ) => {
    const assistantMessageId = crypto.randomUUID();

    return {
      id: assistantMessageId,
      role: 'assistant',
      content,
      conversationId,
      metadata: {
        replyToId,
        model: config?.model || "huggingface",
        provider: config?.provider || "huggingface",
      },
      timestamp: new Date()
    };
  };

  return {
    createUserMessage,
    createAssistantMessage,
    saveMessageToDatabase
  };
};
