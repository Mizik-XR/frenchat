
import { v4 as uuidv4 } from 'uuid';
import { saveMessageToDatabase } from '../utils/responseHandlers';

// Types
export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversationId: string;
  metadata?: any;
  createdAt?: number;
}

export interface SavedMessage extends Message {
  id: string;
  createdAt: number;
}

/**
 * Sauvegarde un message dans la base de données
 */
export const saveMessage = async (message: Message): Promise<SavedMessage | null> => {
  try {
    // Formater le message pour la sauvegarde
    const messageToSave = {
      id: message.id || uuidv4(),
      role: message.role,
      content: message.content,
      conversation_id: message.conversationId,
      metadata: message.metadata || {},
      created_at: new Date().toISOString(),
      user_id: ''  // Sera rempli par saveMessageToDatabase
    };
    
    // Sauvegarder le message
    const savedMessage = await saveMessageToDatabase(messageToSave);
    
    if (!savedMessage) {
      console.error('Failed to save message');
      return null;
    }
    
    // Convertir au format SavedMessage
    return {
      id: savedMessage.id,
      role: savedMessage.role as 'user' | 'assistant' | 'system',
      content: savedMessage.content,
      conversationId: savedMessage.conversation_id,
      metadata: savedMessage.metadata,
      createdAt: new Date(savedMessage.created_at || Date.now()).getTime()
    };
  } catch (error) {
    console.error('Error saving message:', error);
    return null;
  }
};

/**
 * Récupère les messages d'une conversation
 */
export const getMessages = async (conversationId: string): Promise<SavedMessage[]> => {
  // Implémentation stub pour le moment
  console.warn('getMessages est un stub et ne récupère pas de vrais messages');
  return [];
};
