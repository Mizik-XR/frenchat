
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';

/**
 * Sauvegarde un message dans la base de données
 * @param message Le message à sauvegarder
 * @returns L'ID du message sauvegardé
 */
export async function saveMessageToDatabase(message: {
  user_id: string;
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversation_id: string;
  metadata?: any;
  created_at?: string;
}) {
  try {
    // Ajouter le message_type requis par le schéma de la table
    const messageType = 
      message.role === 'user' ? 'user_message' : 
      message.role === 'assistant' ? 'ai_response' : 'system_message';
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        id: message.id,
        user_id: message.user_id,
        role: message.role,
        content: message.content,
        conversation_id: message.conversation_id,
        metadata: message.metadata || {},
        message_type: messageType,
        created_at: message.created_at || new Date().toISOString()
      });

    if (error) {
      console.error('Error saving message to database:', error);
      throw error;
    }

    return message.id;
  } catch (error) {
    console.error('Exception saving message to database:', error);
    throw error;
  }
}

/**
 * Traite une réponse de l'IA
 * @param response La réponse de l'IA
 * @param messageContext Le contexte du message (conversation, user, etc.)
 * @returns Le message formaté
 */
export async function processAIResponse(
  response: { content: string; usage?: { total_tokens: number } },
  messageContext: {
    conversationId: string;
    userId: string;
    messageId: string;
    requestId?: string;
  }
): Promise<Message> {
  try {
    const { conversationId, userId, messageId, requestId } = messageContext;
    
    // Créer un ID pour la réponse
    const responseId = `resp_${messageId}`;
    
    // Créer les métadonnées
    const metadata = {
      source: 'ai',
      timestamp: new Date().toISOString(),
      tokens: response.usage?.total_tokens || 0,
      quoted_message: { id: messageId }
    };
    
    // Sauvegarder la réponse en base de données
    await saveMessageToDatabase({
      id: responseId,
      user_id: userId,
      role: 'assistant',
      content: response.content,
      conversation_id: conversationId,
      metadata
    });
    
    // Retourner le message formaté
    return {
      id: responseId,
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
      conversationId,
      metadata
    };
  } catch (error) {
    console.error('Error processing AI response:', error);
    throw error;
  }
}
