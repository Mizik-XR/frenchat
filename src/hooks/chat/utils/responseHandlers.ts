
import { AIProvider, WebUIConfig } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches RAG context for a conversation
 */
export const fetchRagContext = async (conversationId: string) => {
  const { data: ragContext } = await supabase
    .from('rag_contexts')
    .select('context')
    .eq('conversation_id', conversationId)
    .maybeSingle();
    
  return ragContext?.context || null;
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
  const { error } = await supabase
    .from('conversation_messages')
    .insert(message);
    
  if (error) throw error;
  return message;
};
