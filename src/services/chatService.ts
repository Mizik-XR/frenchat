
import { supabase } from '@/integrations/supabase/client';
import { MessageMetadata, MessageType } from '@/types/chat';
import { useAuth } from '@/components/AuthProvider';

export const chatService = {
  /**
   * Send a user message to the chat
   */
  async sendUserMessage(
    content: string, 
    conversationId: string, 
    messageType: MessageType = 'text',
    documentId: string | null = null,
    metadata?: MessageMetadata,
    quotedMessageId?: string
  ) {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const messageData = {
        content,
        role: 'user',
        conversation_id: conversationId,
        message_type: messageType,
        user_id: user.id,
        metadata: metadata || null
      };

      // Add these properties only if they exist
      if (documentId) {
        (messageData as any).document_id = documentId;
      }
      if (quotedMessageId) {
        (messageData as any).quoted_message_id = quotedMessageId;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error("Error sending user message:", error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Exception sending user message:", error);
      throw error;
    }
  },

  /**
   * Send an assistant message to the chat
   */
  async sendAssistantMessage(
    content: string, 
    conversationId: string,
    messageType: MessageType = 'text',
    documentId: string | null = null,
    metadata?: MessageMetadata,
    quotedMessageId?: string
  ) {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const messageData = {
        content,
        role: 'assistant',
        conversation_id: conversationId,
        message_type: messageType,
        user_id: user.id,
        metadata: metadata || null
      };

      // Add these properties only if they exist
      if (documentId) {
        (messageData as any).document_id = documentId;
      }
      if (quotedMessageId) {
        (messageData as any).quoted_message_id = quotedMessageId;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error("Error sending assistant message:", error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Exception sending assistant message:", error);
      throw error;
    }
  }
};
