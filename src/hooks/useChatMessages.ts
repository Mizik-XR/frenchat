
import { useState, useEffect, useCallback } from "react";
import { Message, MessageMetadata } from "@/types/chat";
import { toast } from "sonner";

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction sécurisée pour récupérer les messages
  const fetchMessages = useCallback(async (convoId: string) => {
    if (!convoId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching messages for conversation: ${convoId}`);
      
      // Simulate API call to fetch messages
      // In a real app, this would be an API call
      setTimeout(() => {
        try {
          const dummyMessages: Message[] = [];
          setMessages(dummyMessages);
        } catch (err) {
          console.error("Error parsing messages:", err);
          setError("Impossible de charger les messages. Format de données incorrect.");
          toast.error("Erreur lors du chargement des messages");
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Impossible de récupérer les messages. Veuillez réessayer.");
      toast.error("Erreur de connexion");
      setIsLoading(false);
    }
  }, []);

  // Charger les messages au changement de conversation
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
      setError(null);
    }
  }, [conversationId, fetchMessages]);

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
    setError(null);
  };

  // Fonction améliorée pour envoyer un message
  const sendMessage = async (content: string, replyToId?: string) => {
    if (!content.trim() || !conversationId) return;

    try {
      const userMessage = addUserMessage(content);
      setIsLoading(true);
      setError(null);

      // Simulate API call
      setTimeout(() => {
        try {
          setAssistantResponse("Voici une réponse de l'assistant IA");
          setIsLoading(false);
        } catch (err) {
          console.error("Error processing response:", err);
          setError("Erreur lors du traitement de la réponse");
          toast.error("Erreur de traitement");
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Impossible d'envoyer le message");
      toast.error("Erreur d'envoi");
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    setIsLoading,
    addUserMessage,
    updateLastMessage,
    setAssistantResponse,
    clearMessages,
    sendMessage,
    fetchMessages
  };
}
