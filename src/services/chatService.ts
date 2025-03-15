
import { supabase } from '@/integrations/supabase/client';
import { MessageMetadata, MessageType } from '@/types/chat';

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
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            content,
            role: 'user',
            conversation_id: conversationId,
            message_type: messageType,
            document_id: documentId,
            metadata,
            quoted_message_id: quotedMessageId
          }
        ])
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
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            content,
            role: 'assistant',
            conversation_id: conversationId,
            message_type: messageType,
            document_id: documentId,
            metadata,
            quoted_message_id: quotedMessageId
          }
        ])
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
