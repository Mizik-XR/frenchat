
import { useState } from 'react';
import { Message, MessageType } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createMessage = (
    role: 'user' | 'assistant',
    content: string,
    type: MessageType = 'text',
    context?: string
  ): Message => ({
    id: Math.random().toString(36).substring(2, 15),
    role,
    content,
    type,
    context,
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

  const setAssistantResponse = (content: string, context?: string) => {
    const message = createMessage('assistant', content, 'text', context);
    setMessages((prev) => [...prev.slice(0, -1), message]);
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
