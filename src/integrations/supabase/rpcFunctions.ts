
/**
 * Définitions des fonctions RPC Supabase personnalisées
 */
import { supabase } from './client';
import { RagContext } from './sharedTypes';
import { jsonToType } from './typesCompatibility';

/**
 * Récupère le contexte RAG pour une conversation
 */
export const getRagContext = async (conversationId: string): Promise<RagContext | null> => {
  try {
    // Vérifier si la table existe avant de faire la requête
    try {
      // Tentative d'utilisation de l'approche directe - mais elle peut échouer si la table n'existe pas
      const { data: tableInfo } = await supabase
        .from('chat_messages')  // Utiliser une table qui existe certainement
        .select('*')
        .limit(1);
      
      // Si nous arrivons ici, continuons avec la méthode alternative
      console.log('Utilisation de la méthode alternative pour getRagContext');
      
      // Méthode alternative - recherche dans les messages de la conversation
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('content, metadata')
        .eq('conversation_id', conversationId)
        .eq('role', 'system')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (messagesError || !messages || messages.length === 0) {
        return null;
      }
      
      // Essayer d'extraire le contexte des métadonnées ou du contenu
      const message = messages[0];
      
      // Manipuler les métadonnées sous forme de Json
      let contextData = null;
      let sourceData = '';
      let metadataObj = {};
      
      if (message.metadata) {
        if (typeof message.metadata === 'string') {
          try {
            metadataObj = JSON.parse(message.metadata);
            contextData = metadataObj['context'] || null;
            sourceData = metadataObj['source'] || '';
          } catch (e) {
            console.error('Erreur de parsing JSON des métadonnées:', e);
          }
        } else {
          metadataObj = message.metadata;
          contextData = message.metadata['context'] || null;
          sourceData = message.metadata['source'] || '';
        }
      }
      
      // Si pas de contexte dans les métadonnées, utiliser le contenu du message
      if (!contextData) {
        contextData = message.content;
      }
      
      return contextData ? { 
        context: contextData.toString(),
        source: sourceData.toString(),
        metadata: metadataObj
      } : null;
    } catch (tableError) {
      console.error('Error checking table existence:', tableError);
      return null;
    }
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
  try {
    const userData = await supabase.auth.getUser();
    
    if (!userData.data.user) {
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
        user_id: userData.data.user.id,
        created_at: params.timestamp.toISOString()
      });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error in insertChatMessage:', error);
    throw error;
  }
};
