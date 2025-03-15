
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from './useAuthSession';
import { APP_STATE } from '@/integrations/supabase/client';

// Types pour les messages
export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export interface MessageMetadata {
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  imagePath?: string;
  quotedMessageId?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'error';
  processingError?: string;
  sourceDocuments?: Array<{
    title: string;
    content: string;
    url?: string;
    similarity?: number;
  }>;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  createdAt: Date;
  metadata?: MessageMetadata;
  quotedMessage?: ChatMessage;
}

export interface MessageInput {
  conversation_id: string;
  role: MessageRole;
  content: string;
  type: string;
  quoted_message_id?: string;
}

export const useChatMessages = (conversationId: string | null) => {
  const { session } = useAuthSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Charger les messages
  const loadMessages = useCallback(async () => {
    if (!conversationId || !session?.user?.id) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Si nous sommes en mode hors ligne, utiliser des données fictives
      if (APP_STATE.isOfflineMode) {
        console.log('Mode hors ligne: utilisation de données simulées pour les messages');
        const sampleMessages: ChatMessage[] = [
          {
            id: '1',
            role: 'user',
            content: 'Bonjour, comment puis-je vous aider aujourd\'hui?',
            type: 'text',
            createdAt: new Date(Date.now() - 3600000)
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Bonjour! Je suis votre assistant IA prêt à répondre à vos questions. Comment puis-je vous aider aujourd\'hui?',
            type: 'text',
            createdAt: new Date(Date.now() - 3500000)
          }
        ];
        setMessages(sampleMessages);
        setIsLoading(false);
        return;
      }

      // Récupérer les messages de la conversation depuis Supabase
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transformer les données
      const transformedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as MessageRole,
        content: msg.content,
        type: msg.message_type as MessageType,
        createdAt: new Date(msg.created_at),
        metadata: msg.metadata || {}
      }));

      // Ajouter les références aux messages cités
      const messagesMap = new Map<string, ChatMessage>();
      transformedMessages.forEach(msg => messagesMap.set(msg.id, msg));

      transformedMessages.forEach(msg => {
        const quotedId = msg.metadata?.quotedMessageId;
        if (quotedId && messagesMap.has(quotedId)) {
          msg.quotedMessage = messagesMap.get(quotedId);
        }
      });

      setMessages(transformedMessages);
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, session?.user?.id]);

  // Envoyer un message
  const sendMessage = useCallback(async (input: MessageInput): Promise<ChatMessage | null> => {
    if (!session?.user?.id || !conversationId) {
      setError(new Error('Utilisateur non authentifié ou conversation non spécifiée'));
      return null;
    }

    try {
      // Préparer les données à insérer
      const messageData = {
        conversation_id: input.conversation_id,
        role: input.role,
        content: input.content,
        message_type: input.type,
        user_id: session.user.id,
        metadata: input.quoted_message_id 
          ? { quotedMessageId: input.quoted_message_id }
          : {}
      };

      // Insérer le message dans la base de données
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Transformer le message inséré
      const newMessage: ChatMessage = {
        id: data.id,
        role: data.role as MessageRole,
        content: data.content,
        type: data.message_type as MessageType,
        createdAt: new Date(data.created_at),
        metadata: data.metadata || {}
      };

      // Si le message cite un autre message, ajouter la référence
      if (input.quoted_message_id) {
        const quotedMessage = messages.find(msg => msg.id === input.quoted_message_id);
        if (quotedMessage) {
          newMessage.quotedMessage = quotedMessage;
        }
      }

      // Mettre à jour l'état des messages
      setMessages(prevMessages => [...prevMessages, newMessage]);

      return newMessage;
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      return null;
    }
  }, [conversationId, session?.user?.id, messages]);

  // Charger les messages au montage du composant
  useEffect(() => {
    if (conversationId && session?.user?.id) {
      loadMessages();
    }
  }, [conversationId, session?.user?.id, loadMessages]);

  return {
    messages,
    isLoading,
    error,
    refreshMessages: loadMessages,
    sendMessage
  };
};
