import { supabase } from "@/integrations/supabase/client";
import { Message, MessageType, MessageMetadata } from "@/types/chat";
import { apiConfig } from "./apiConfig";

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

    return {
      id: data.id,
      role: data.role === 'user' ? 'user' : 'assistant',
      content: data.content,
      type: data.message_type as MessageType,
      context: data.context,
      metadata: data.metadata as MessageMetadata,
      conversationId: data.conversation_id,
      timestamp: new Date(data.created_at)
    };
  },

  async sendAssistantMessage(
    content: string, 
    conversationId: string, 
    type: MessageType = 'text',
    metadata?: MessageMetadata
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

    return {
      id: data.id,
      role: data.role === 'user' ? 'user' : 'assistant',
      content: data.content,
      type: data.message_type as MessageType,
      context: data.context,
      metadata: data.metadata as MessageMetadata,
      conversationId: data.conversation_id,
      timestamp: new Date(data.created_at)
    };
  },

  async generateResponse(prompt: string): Promise<string> {
    const headers = await apiConfig.getHeaders();
    const response = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.textGeneration}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    return data.generated_text;
  }
};
