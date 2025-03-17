
import { AIProvider, WebUIConfig } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { RagContext } from "@/integrations/supabase/sharedTypes";

/**
 * Fetches RAG context for a conversation
 */
export const fetchRagContext = async (conversationId: string) => {
  try {
    // Utiliser une requête SQL personnalisée ou RPC pour éviter les problèmes de typage
    const { data, error } = await supabase
      .rpc('get_rag_context', { conversation_id: conversationId });
      
    if (error) {
      console.error('Error fetching RAG context:', error);
      return null;
    }
    
    return data as RagContext | null;
  } catch (error) {
    console.error('Error in fetchRagContext:', error);
    return null;
  }
};

/**
 * Safely extracts text from Anthropic API response
 */
export const extractAnthropicResponse = (response: unknown): string => {
  // Vérification sécuritaire du type de réponse et extraction du contenu
  if (response && 
      typeof response === 'object' && 
      'content' in response && 
      Array.isArray(response.content) && 
      response.content.length > 0 && 
      typeof response.content[0] === 'object' && 
      'text' in response.content[0]) {
    return response.content[0].text || "";
  }
  return "";
};

/**
 * Creates and saves a message to the database
 */
export const saveMessageToDatabase = async (
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    conversationId: string;
    metadata: any;
    timestamp: Date;
  }
) => {
  try {
    const { error } = await supabase.rpc('insert_chat_message', {
      p_id: message.id,
      p_role: message.role,
      p_content: message.content,
      p_conversation_id: message.conversationId,
      p_metadata: message.metadata,
      p_created_at: message.timestamp.toISOString()
    });
    
    if (error) throw error;
    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};
