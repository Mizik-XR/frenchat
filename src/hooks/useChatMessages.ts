
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { AIProvider, MessageMetadata, MessageType } from '@/types/chat';
import { useAuthSession } from './useAuthSession';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  message_type: MessageType;
  conversation_id: string;
  created_at: string;
  metadata?: any;
  quoted_message_id?: string;
}

export const useChatMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Charger les messages lorsque la conversation change
  useEffect(() => {
    if (conversationId && user) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId, user]);

  // Fonction pour récupérer les messages
  const fetchMessages = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setMessages(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Envoyer un message utilisateur et recevoir une réponse de l'IA
  const sendMessage = useCallback(async (content: string, quotedMessageId?: string) => {
    if (!conversationId || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Envoyer le message utilisateur
      const { data: userMessage, error: userMessageError } = await supabase
        .from('chat_messages')
        .insert({
          content,
          role: 'user',
          conversation_id: conversationId,
          message_type: 'text',
          user_id: user.id,
          quoted_message_id: quotedMessageId || null
        })
        .select()
        .single();
        
      if (userMessageError) throw userMessageError;
      
      // Ajouter le message à l'état local immédiatement
      setMessages(prev => [...prev, userMessage]);
      
      // Simuler une réponse de l'IA (à remplacer par un appel à l'API d'IA)
      // Dans une application réelle, vous appelleriez votre service d'IA ici
      setTimeout(async () => {
        try {
          const aiResponse = "Voici une réponse simulée de l'assistant. Dans une application réelle, cette réponse viendrait d'un modèle d'IA.";
          
          // Cast the metadata to be compatible with MessageMetadata type
          const metadata: MessageMetadata = {
            provider: 'huggingface',
            aiService: {
              type: 'local',
              endpoint: 'http://localhost:8000',
              actualServiceUsed: 'local'
            }
          };
          
          const { data: assistantMessage, error: assistantMessageError } = await supabase
            .from('chat_messages')
            .insert({
              content: aiResponse,
              role: 'assistant',
              conversation_id: conversationId,
              message_type: 'text',
              user_id: user.id,
              metadata: metadata,
              quoted_message_id: userMessage.id // Référencer le message de l'utilisateur
            })
            .select()
            .single();
            
          if (assistantMessageError) throw assistantMessageError;
          
          // Ajouter la réponse à l'état local
          setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
          console.error('Erreur lors de la génération de la réponse:', err);
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      }, 1000); // Délai simulé pour la réponse de l'IA
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err as Error);
      setIsLoading(false);
    }
  }, [conversationId, user]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages: fetchMessages
  };
};
