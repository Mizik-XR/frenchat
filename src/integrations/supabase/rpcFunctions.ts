
/**
 * Définitions des fonctions RPC Supabase personnalisées
 */
import { supabase } from './client';
import { RagContext } from './sharedTypes';

/**
 * Récupère le contexte RAG pour une conversation
 */
export const getRagContext = async (conversationId: string): Promise<RagContext | null> => {
  try {
    // Utiliser une requête Select standard au lieu de RPC
    const { data, error } = await supabase
      .from('rag_contexts')
      .select('context, source, metadata')
      .eq('conversation_id', conversationId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching RAG context:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Conversion explicite vers le type RagContext pour assurer la compatibilité
    return {
      context: data.context as string,
      source: data.source as string | undefined,
      metadata: data.metadata || undefined
    };
  } catch (error) {
    console.error('Error in getRagContext:', error);
    return null;
  }
};

/**
 * Insère un message de chat dans la base de données
 */
export const insertChatMessage = async (
  params: {
    id: string;
    role: string;
    content: string;
    conversationId: string;
    metadata: any;
    timestamp: Date;
  }
) => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      id: params.id,
      role: params.role,
      content: params.content,
      conversation_id: params.conversationId,
      metadata: params.metadata,
      message_type: 'text',
      user_id: currentUser.id,
      created_at: params.timestamp.toISOString()
    });
  
  if (error) throw error;
  return { success: true };
};
