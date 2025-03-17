
import { AIProvider, WebUIConfig } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { RagContext } from "@/integrations/supabase/sharedTypes";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Fetches RAG context for a conversation
 */
export const fetchRagContext = async (conversationId: string) => {
  try {
    // Utilisation d'une requête SQL personnalisée pour éviter les problèmes de typage
    const { data, error } = await supabase
      .from('rag_contexts')
      .select('context, source, metadata')
      .eq('conversation_id', conversationId)
      .maybeSingle();
      
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
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        id: message.id,
        role: message.role,
        content: message.content,
        conversation_id: message.conversationId,
        metadata: message.metadata,
        message_type: 'text',
        user_id: (await supabase.auth.getUser()).data.user?.id,
        created_at: message.timestamp.toISOString()
      });
    
    if (error) throw error;
    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};
