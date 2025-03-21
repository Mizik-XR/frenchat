
import { AIProvider, WebUIConfig } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

/**
 * Fetches RAG context for a conversation
 */
export const fetchRagContext = async (conversationId: string) => {
  try {
    // Vérifier si la table 'rag_contexts' existe
    const { error: tableExistsError } = await supabase
      .from('rag_contexts')
      .select('id')
      .limit(1);
      
    if (tableExistsError) {
      console.warn("Table 'rag_contexts' not found:", tableExistsError.message);
      return null;
    }
    
    // Si la table existe, récupérer le contexte
    const { data: ragContext, error } = await supabase
      .from('rag_contexts')
      .select('context')
      .eq('conversation_id', conversationId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching RAG context:", error);
      return null;
    }
    
    return ragContext?.context as string | null;
  } catch (error) {
    console.error("Exception while fetching RAG context:", error);
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
      Array.isArray((response as any).content) && 
      (response as any).content.length > 0 && 
      typeof (response as any).content[0] === 'object' && 
      'text' in (response as any).content[0]) {
    return (response as any).content[0].text || "";
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
    // Vérifier si la table 'chat_messages' existe
    const { error: tableExistsError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);
      
    if (tableExistsError) {
      console.warn("Table 'chat_messages' not found:", tableExistsError.message);
      return message;
    }
    
    // Conversion du message au format attendu par la base de données
    const dbMessage = {
      id: message.id,
      role: message.role,
      content: message.content,
      conversation_id: message.conversationId,
      message_type: 'text',
      metadata: message.metadata as Json,
      created_at: message.timestamp.toISOString(),
      user_id: (await supabase.auth.getUser()).data.user?.id || 'anonymous'
    };
    
    const { error } = await supabase
      .from('chat_messages')
      .insert(dbMessage);
      
    if (error) {
      console.error("Error saving message to database:", error);
    }
    
    return message;
  } catch (error) {
    console.error("Exception while saving message:", error);
    return message;
  }
};
