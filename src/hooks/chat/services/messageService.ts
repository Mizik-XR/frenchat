
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Message, SendMessageOptions } from '../types';

export interface MessageServiceType {
  createUserMessage: (
    content: string, 
    conversationId: string, 
    files?: File[], 
    fileUrls?: string[],
    replyTo?: string,
    config?: any
  ) => Message;
  
  createAssistantMessage: (
    content: string, 
    conversationId: string, 
    userMessageId: string,
    config?: any
  ) => Message;
  
  saveMessageToDatabase: (message: Omit<Message, 'timestamp' | 'conversationId'> & { 
    conversation_id: string,
    created_at?: string
  }) => Promise<void>;
}

export const messageService: MessageServiceType = {
  createUserMessage: (content, conversationId, files = [], fileUrls = [], replyTo, config) => {
    const timestamp = Date.now();
    const metadata: any = {};
    
    if (files.length > 0 || fileUrls.length > 0) {
      metadata.files = files.map(file => file.name);
      metadata.fileUrls = fileUrls;
    }
    
    if (replyTo) {
      metadata.quoted_message = { id: replyTo };
    }
    
    if (config?.provider) {
      metadata.provider = config.provider;
    }
    
    if (config?.model) {
      metadata.model = config.model;
    }
    
    return {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp,
      conversationId,
      metadata
    };
  },
  
  createAssistantMessage: (content, conversationId, userMessageId, config) => {
    const timestamp = Date.now();
    const metadata: any = {
      source: 'ai',
      timestamp: new Date().toISOString(),
    };
    
    if (userMessageId) {
      metadata.quoted_message = { id: userMessageId };
    }
    
    if (config?.provider) {
      metadata.provider = config.provider;
    }
    
    if (config?.model) {
      metadata.model = config.model;
    }
    
    if (config?.tokens) {
      metadata.tokens = config.tokens;
    }
    
    return {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp,
      conversationId,
      metadata
    };
  },
  
  saveMessageToDatabase: async (message) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          role: message.role,
          content: message.content,
          conversation_id: message.conversation_id,
          user_id: message.user_id,
          metadata: message.metadata,
          message_type: message.role === 'assistant' ? 'ai_response' : 'user_message',
          created_at: message.created_at || new Date().toISOString()
        });
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error("Error saving message to database:", err);
      throw err;
    }
  }
};

export const useMessageService = () => {
  return messageService;
};
