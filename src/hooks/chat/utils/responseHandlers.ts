
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { createChatPrompt } from './promptBuilder';
import { AICacheService } from '@/services/cacheService';

// Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  createdAt?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversation_id: string;
  metadata?: any;
  created_at?: string;
  user_id?: string;
}

// Ajouter cette fonction pour la compatibilité avec le code existant
export const saveMessageToDatabase = async (
  message: ChatMessage
): Promise<ChatMessage | null> => {
  try {
    // Récupération de l'utilisateur courant
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    // S'assurer que l'ID utilisateur est défini
    const messageWithUserId = {
      ...message,
      user_id: message.user_id || user.id
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageWithUserId)
      .select()
      .single();

    if (error) {
      console.error('Error saving message to database:', error);
      return null;
    }

    return data as ChatMessage;
  } catch (error) {
    console.error('Error in saveMessageToDatabase:', error);
    return null;
  }
};

// Fonction pour transformer les messages avant envoi à l'IA
export const prepareMessagesForAI = (messages: Message[]): any[] => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

// Fonction pour enregistrer la réponse en cache
export const cacheResponse = async (
  prompt: string,
  response: string,
  modelId: string
): Promise<void> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      console.warn('No user ID available for caching');
      return;
    }

    const cacheService = new AICacheService();
    await cacheService.upsertCache(`${prompt}-${modelId}`, {
      prompt,
      response,
      provider: modelId,
      user_id: userId,
      tokens_used: 0,
      estimated_cost: 0,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error caching response:', error);
  }
};

// Fonction pour générer un ID unique pour un message
export const generateMessageId = (): string => {
  return uuidv4();
};

// Fonction pour formater la date en ISO string
export const formatDate = (date: Date = new Date()): string => {
  return date.toISOString();
};
