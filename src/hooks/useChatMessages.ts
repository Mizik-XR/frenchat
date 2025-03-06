
import { useState, useEffect, useCallback } from 'react';
import { Message, MessageType, MessageMetadata } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useChatMessages(conversationId: string | null = null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ajout de la fonction fetchMessages qui manquait
  const fetchMessages = useCallback(async (convId: string) => {
    if (!convId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Erreur lors du chargement des messages:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setMessages(data.map((msg: any): Message => ({
          id: msg.id,
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
          type: msg.message_type as MessageType,
          context: msg.context,
          metadata: msg.metadata as MessageMetadata,
          conversationId: msg.conversation_id,
          timestamp: new Date(msg.created_at),
          quotedMessageId: msg.quoted_message_id
        })));
      }
    } catch (e) {
      console.error("Exception lors du chargement des messages:", e);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
    
    // Configuration de la souscription en temps réel
    let subscription: any;
    
    if (conversationId) {
      try {
        subscription = supabase
          .channel('chat_messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`
          }, (payload) => {
            const newMsg = payload.new as any;
            setMessages(prev => [...prev, {
              id: newMsg.id,
              role: newMsg.role === 'user' ? 'user' : 'assistant',
              content: newMsg.content,
              type: newMsg.message_type as MessageType,
              context: newMsg.context,
              metadata: newMsg.metadata as MessageMetadata,
              conversationId: newMsg.conversation_id,
              timestamp: new Date(newMsg.created_at),
              quotedMessageId: newMsg.quoted_message_id
            }]);
          })
          .subscribe();
      } catch (e) {
        console.error("Erreur lors de la configuration de la souscription en temps réel:", e);
      }
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.error("Erreur lors de la désinscription:", e);
        }
      }
    };
  }, [conversationId, fetchMessages]);

  const createMessage = (
    role: 'user' | 'assistant',
    content: string,
    type: MessageType = 'text',
    context?: string,
    metadata?: MessageMetadata
  ): Message => {
    if (!conversationId) {
      throw new Error("Aucune conversation sélectionnée");
    }
    
    return {
      id: Math.random().toString(36).substring(2, 15),
      role,
      content,
      type,
      context,
      metadata,
      conversationId: conversationId,
      timestamp: new Date(),
    };
  };

  const addUserMessage = (content: string) => {
    const message = createMessage('user', content);
    setMessages((prev) => [...prev, message]);
    return message;
  };

  const updateLastMessage = (content: string, context?: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const lastMessage = prev[prev.length - 1];
      const message = {
        ...lastMessage,
        content,
        context: context || lastMessage.context
      };
      return [...prev.slice(0, -1), message];
    });
  };

  const setAssistantResponse = (content: string, context?: string, metadata?: MessageMetadata) => {
    const message = createMessage('assistant', content, 'text', context, metadata);
    setMessages((prev) => [...prev, message]);
    return message;
  };

  // Ajout de la fonction sendMessage qui manquait
  const sendMessage = async (text: string, convId: string, replyToId?: string) => {
    if (!convId) return;
    
    setIsLoading(true);
    try {
      // Créer le message utilisateur
      const userMsg = addUserMessage(text);
      
      // Simuler une réponse IA (à remplacer par votre vraie logique)
      setTimeout(() => {
        setAssistantResponse("Voici une réponse de l'assistant", undefined, {
          replyTo: replyToId ? {
            id: replyToId,
            content: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
            role: 'user'
          } : undefined
        });
        setIsLoading(false);
      }, 1000);
      
      return userMsg;
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    updateLastMessage,
    setAssistantResponse,
    clearMessages,
    // Ajout des fonctions manquantes
    fetchMessages,
    sendMessage
  };
}
