
import { useState } from 'react';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateMessageId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: content,
      type: 'text',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateLastMessage = (content: string, context?: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: content,
        type: 'text',
        context: context,
        timestamp: new Date()
      };
      newMessages[newMessages.length - 1] = lastMessage;
      return newMessages;
    });
  };

  const setAssistantResponse = (content: string, context?: string) => {
    const newMessage: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content: content,
      type: 'text',
      context: context,
      timestamp: new Date()
    };
    
    setMessages(prev => [
      ...prev.slice(0, -1),
      newMessage
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
