
import { useState, useEffect, useCallback } from "react";
import { Message, MessageMetadata } from "@/types/chat";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour formater les messages depuis Supabase
  const formatMessages = useCallback((data: any[]): Message[] => {
    return data.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      type: msg.type || 'text',
      conversationId: msg.conversation_id,
      timestamp: new Date(msg.created_at).getTime(),
      replyTo: msg.reply_to,
      quotedMessageId: msg.quoted_message_id,
      metadata: msg.metadata
    }));
  }, []);

  // Fonction pour récupérer les messages
  const fetchMessages = useCallback(async (convoId: string) => {
    if (!convoId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching messages for conversation: ${convoId}`);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const formattedMessages = formatMessages(data);
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Impossible de récupérer les messages. Veuillez réessayer.");
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  }, [formatMessages]);

  // Charger les messages au changement de conversation
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
      setError(null);
    }
  }, [conversationId, fetchMessages]);

  // Fonction pour ajouter un message utilisateur
  const addUserMessage = useCallback((content: string, replyToId?: string): Message => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      type: 'text',
      conversationId: conversationId || 'default',
      timestamp: Date.now(),
      quotedMessageId: replyToId
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, [conversationId]);

  // Fonction pour mettre à jour le dernier message
  const updateLastMessage = useCallback((content: string, context?: string) => {
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
  }, []);

  // Fonction pour ajouter une réponse de l'assistant
  const setAssistantResponse = useCallback((content: string, context?: string, metadata?: MessageMetadata): Message => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: content,
      type: 'text',
      context: context,
      metadata: metadata,
      conversationId: conversationId || 'default',
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, [conversationId]);

  // Fonction pour effacer tous les messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Fonction pour sauvegarder un message dans Supabase
  const saveMessageToSupabase = useCallback(async (messageData: {
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    type: string;
    quoted_message_id?: string;
  }) => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      console.warn("Tentative de sauvegarde de message sans authentification");
      return;
    }
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: messageData.conversation_id,
        role: messageData.role,
        content: messageData.content,
        message_type: messageData.type,
        quoted_message_id: messageData.quoted_message_id,
        user_id: user.id
      });
    
    if (error) throw error;
  }, []);

  // Fonction pour simuler une réponse de l'IA
  const generateAIResponse = useCallback(async (content: string, convoId: string) => {
    try {
      const responseText = "Voici une réponse de l'assistant IA à votre message: " + content;
      
      await saveMessageToSupabase({
        conversation_id: convoId,
        role: 'assistant',
        content: responseText,
        type: 'text'
      });
      
      setAssistantResponse(responseText);
      setIsLoading(false);
    } catch (err) {
      console.error("Error processing response:", err);
      setError("Erreur lors du traitement de la réponse");
      toast.error("Erreur de traitement");
      setIsLoading(false);
    }
  }, [saveMessageToSupabase, setAssistantResponse]);

  // Fonction principale pour envoyer un message
  const sendMessage = useCallback(async (content: string, convoId: string, replyToId?: string) => {
    if (!content.trim() || !convoId) return;

    try {
      const userMessage = addUserMessage(content, replyToId);
      setIsLoading(true);
      setError(null);

      await saveMessageToSupabase({
        conversation_id: convoId,
        role: 'user',
        content: content,
        type: 'text',
        quoted_message_id: replyToId
      });

      // Simulation de réponse IA avec un délai
      setTimeout(() => {
        generateAIResponse(content, convoId);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Impossible d'envoyer le message");
      toast.error("Erreur d'envoi");
      setIsLoading(false);
    }
  }, [addUserMessage, generateAIResponse, saveMessageToSupabase]);

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
