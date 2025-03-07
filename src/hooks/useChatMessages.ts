
import { useState, useEffect, useCallback } from "react";
import { Message, MessageMetadata } from "@/types/chat";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Récupération des messages depuis Supabase
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        type: msg.type || 'text',
        conversationId: msg.conversation_id,
        timestamp: new Date(msg.created_at),
        replyTo: msg.reply_to,
        quotedMessageId: msg.quoted_message_id,
        metadata: msg.metadata
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Impossible de récupérer les messages. Veuillez réessayer.");
      toast.error("Erreur de connexion");
    } finally {
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

  const addUserMessage = (content: string, replyToId?: string): Message => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      type: 'text',
      conversationId: conversationId || 'default',
      timestamp: new Date(),
      quotedMessageId: replyToId
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
  const sendMessage = async (content: string, convoId: string, replyToId?: string) => {
    if (!content.trim() || !convoId) return;

    try {
      const userMessage = addUserMessage(content, replyToId);
      setIsLoading(true);
      setError(null);

      // Enregistrement du message utilisateur dans Supabase
      const { error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: convoId,
          role: 'user',
          content: content,
          type: 'text',
          quoted_message_id: replyToId
        });

      if (userMsgError) throw userMsgError;

      // Simulation de réponse IA
      setTimeout(() => {
        try {
          const responseText = "Voici une réponse de l'assistant IA à votre message: " + content;
          
          // Enregistrement de la réponse de l'assistant dans Supabase
          supabase
            .from('chat_messages')
            .insert({
              conversation_id: convoId,
              role: 'assistant',
              content: responseText,
              type: 'text'
            })
            .then(({ error: assistantMsgError }) => {
              if (assistantMsgError) throw assistantMsgError;
            });
          
          setAssistantResponse(responseText);
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
