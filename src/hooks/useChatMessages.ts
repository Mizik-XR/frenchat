
import { useState } from 'react';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
  };

  const updateLastMessage = (content: string, context?: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        role: 'assistant',
        content,
        context
      };
      return newMessages;
    });
  };

  const setAssistantResponse = (content: string, context?: string) => {
    setMessages(prev => [
      ...prev.slice(0, -1),
      { 
        role: 'assistant', 
        content,
        context
      }
    ]);
  };

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    updateLastMessage,
    setAssistantResponse
  };
}
