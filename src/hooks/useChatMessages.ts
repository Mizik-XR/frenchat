
import { useState, useEffect, useCallback } from '@/core/ReactInstance';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

export type MessageType = 'user' | 'assistant' | 'system';

export interface MessageMetadata {
  source?: string;
  timestamp?: string;
  model?: string;
  tokens?: number;
  quoted_message?: any;
}

export interface ChatMessage {
  id: string;
  role: MessageType;
  content: string;
  conversation_id: string;
  user_id?: string;
  metadata?: MessageMetadata;
  created_at?: string;
  createdAt?: number;
  updatedAt?: number;
}

export const useChatMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch messages on conversation change
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Transform to ChatMessage format
      const formattedMessages = data.map((msg): ChatMessage => ({
        id: msg.id,
        role: msg.role as MessageType,
        content: msg.content,
        conversation_id: msg.conversation_id,
        user_id: msg.user_id,
        metadata: msg.metadata as MessageMetadata,
        created_at: msg.created_at,
        createdAt: new Date(msg.created_at).getTime(),
        updatedAt: new Date(msg.updated_at || msg.created_at).getTime()
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, conversationId]);

  // Add a new message
  const addMessage = async (message: Omit<ChatMessage, 'id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const newMessage: ChatMessage = {
        id: uuidv4(),
        ...message,
        user_id: userId,
        created_at: new Date().toISOString(),
        createdAt: Date.now()
      };
      
      // Add to local state first
      setMessages(prev => [...prev, newMessage]);
      
      // Then save to database
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          id: newMessage.id,
          role: newMessage.role,
          content: newMessage.content,
          conversation_id: newMessage.conversation_id,
          user_id: newMessage.user_id,
          metadata: {
            ...newMessage.metadata,
            // Pour compatibilité avec le code existant qui pourrait attendre quoted_message_id
            quoted_message_id: newMessage.metadata?.quoted_message?.id
          },
          message_type: newMessage.role === 'assistant' ? 'ai_response' : 'user_message',
          created_at: newMessage.created_at
        });
      
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      return newMessage;
    } catch (err) {
      console.error('Error adding message:', err);
      throw err;
    }
  };
  
  // Update a message
  const updateMessage = async (id: string, updates: Partial<ChatMessage>) => {
    try {
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({
          ...updates,
          message_type: updates.role === 'assistant' ? 'ai_response' : 'user_message',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
      );
      
      return true;
    } catch (err) {
      console.error('Error updating message:', err);
      return false;
    }
  };
  
  // Delete a message
  const deleteMessage = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      return false;
    }
  };

  return {
    messages,
    isLoading,
    error,
    addMessage,
    updateMessage,
    deleteMessage,
    fetchMessages
  };
};
