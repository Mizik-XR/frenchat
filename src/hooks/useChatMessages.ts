
import { useState, useEffect } from "react";
import { Message, MessageMetadata } from "@/types/chat";

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const fetchMessages = async (convoId: string) => {
    if (!convoId) return;
    
    setIsLoading(true);
    try {
      // Simulate API call to fetch messages
      // In a real app, this would be an API call
      setTimeout(() => {
        const dummyMessages: Message[] = [];
        setMessages(dummyMessages);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    }
  };

  const addUserMessage = (content: string): Message => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      type: 'text',
      conversationId: conversationId || 'default',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const updateLastMessage = (content: string, context?: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        const lastMsg = { ...updated[updated.length - 1] };
        lastMsg.content = content;
        if (context) lastMsg.context = context;
        updated[updated.length - 1] = lastMsg;
      }
      return updated;
    });
  };

  const setAssistantResponse = (content: string, context?: string, metadata?: MessageMetadata): Message => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: content,
      type: 'text',
      context: context,
      metadata: metadata,
      conversationId: conversationId || 'default',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const clearMessages = () => {
    setMessages([]);
  };

  // Add the missing send message function
  const sendMessage = async (content: string, replyToId?: string) => {
    if (!content.trim() || !conversationId) return;

    const userMessage = addUserMessage(content);
    setIsLoading(true);

    try {
      // Simulate API call
      setTimeout(() => {
        setAssistantResponse("This is a response from the AI assistant");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    updateLastMessage,
    setAssistantResponse,
    clearMessages,
    sendMessage,
    fetchMessages
  };
}
