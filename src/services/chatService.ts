
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Type MessageType pour aider à résoudre l'erreur string vs MessageType
export type MessageType = 'user' | 'assistant' | 'system' | string;

// Interface modifiée pour correspondre à la table
export interface ChatMessage {
  id: string;
  content: string;
  role: MessageType;
  conversation_id: string;
  metadata?: any;
  created_at?: string;
  message_type?: string;
  user_id: string;
  context?: string;
}

// Interface pour les métadonnées
export interface MessageMetadata {
  source?: string;
  timestamp?: string;
  model?: string;
  tokens?: number;
  quoted_message?: any;
  // Ajout de cette propriété pour compatibilité avec le code existant
  quoted_message_id?: string;
}

/**
 * Récupère les messages d'une conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    // Assurons-nous que chaque message a le bon format (notamment role typé comme MessageType)
    const formattedMessages = messages.map(msg => ({
      ...msg,
      role: msg.role as MessageType,
      metadata: msg.metadata || {},
      message_type: msg.message_type || 'text',
      user_id: msg.user_id || ''
    }));
    
    return formattedMessages as ChatMessage[];
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
};

/**
 * Ajoute un nouveau message à une conversation
 */
export const addMessage = async (message: ChatMessage): Promise<ChatMessage | null> => {
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error('User not authenticated');
      return null;
    }
    
    // Assurer que le user_id est défini
    const messageToAdd = {
      ...message,
      id: message.id || uuidv4(),
      user_id: message.user_id || userData.user.id,
      created_at: message.created_at || new Date().toISOString(),
      message_type: message.message_type || 'text',
    };
    
    // Insérer un message à la fois
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageToAdd)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding message:', error);
      return null;
    }
    
    return data as ChatMessage;
  } catch (error) {
    console.error('Error in addMessage:', error);
    return null;
  }
};

/**
 * Ajoute plusieurs messages à une conversation
 */
export const addMessages = async (messages: ChatMessage[]): Promise<boolean> => {
  try {
    // Insérer les messages un par un pour éviter les problèmes de type
    for (const message of messages) {
      await addMessage(message);
    }
    
    return true;
  } catch (error) {
    console.error('Error in addMessages:', error);
    return false;
  }
};

/**
 * Récupère un message par son ID
 */
export const getMessageById = async (messageId: string): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (error) {
      console.error('Error fetching message by ID:', error);
      return null;
    }
    
    return data as ChatMessage;
  } catch (error) {
    console.error('Error in getMessageById:', error);
    return null;
  }
};
