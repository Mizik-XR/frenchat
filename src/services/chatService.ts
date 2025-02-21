
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageType } from "@/types/chat";

export const chatService = {
  async sendUserMessage(content: string, conversationId: string): Promise<Message> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        role: 'user',
        content,
        message_type: 'text',
        conversation_id: conversationId,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sendAssistantMessage(
    content: string, 
    conversationId: string, 
    type: MessageType = 'text',
    metadata?: any
  ): Promise<Message> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        role: 'assistant',
        content,
        message_type: type,
        conversation_id: conversationId,
        metadata,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
