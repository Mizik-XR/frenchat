
import { useState, useEffect } from 'react';
import { Message, MessageType, MessageMetadata } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages",
          variant: "destructive"
        });
        return;
      }

      setMessages(data.map((msg: any): Message => ({
        id: msg.id,
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
        type: msg.message_type as MessageType,
        context: msg.context,
        metadata: msg.metadata as MessageMetadata,
        conversationId: msg.conversation_id,
        timestamp: new Date(msg.created_at)
      })));
    };

    fetchMessages();

    const subscription = supabase
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
          timestamp: new Date(newMsg.created_at)
        }]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  const createMessage = (
    role: 'user' | 'assistant',
    content: string,
    type: MessageType = 'text',
    context?: string,
    metadata?: MessageMetadata
  ): Message => ({
    id: Math.random().toString(36).substring(2, 15),
    role,
    content,
    type,
    context,
    metadata,
    conversationId: conversationId!,
    timestamp: new Date(),
  });

  const addUserMessage = (content: string) => {
    const message = createMessage('user', content);
    setMessages((prev) => [...prev, message]);
  };

  const updateLastMessage = (content: string, context?: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const message = createMessage('assistant', content, 'text', context);
      return [...prev.slice(0, -1), message];
    });
  };

  const setAssistantResponse = (content: string, context?: string, metadata?: MessageMetadata) => {
    const message = createMessage('assistant', content, 'text', context, metadata);
    setMessages((prev) => [...prev, message]);
  };

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    updateLastMessage,
    setAssistantResponse,
  };
}
