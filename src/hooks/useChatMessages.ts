
import { useState, useEffect, useCallback } from "react";
import { Message, MessageMetadata } from "@/types/chat";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { messageMetadataToJson } from '@/integrations/supabase/typesCompatibility';

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatMessages = useCallback((data: any[]): Message[] => {
    return data.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      type: msg.message_type || 'text',
      conversationId: msg.conversation_id,
      timestamp: new Date(msg.created_at).getTime(),
      replyTo: msg.metadata?.reply_to,
      quotedMessageId: msg.metadata?.quoted_message_id,
      metadata: msg.metadata
    }));
  }, []);

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

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
      setError(null);
    }
  }, [conversationId, fetchMessages]);

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

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const saveMessageToSupabase = useCallback(async (messageData: {
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    type: string;
    quoted_message_id?: string;
  }) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('User not authenticated');
    }
    
    let metadata = null;
    if (messageData.quoted_message_id) {
      metadata = messageMetadataToJson({ 
        quoted_message_id: messageData.quoted_message_id 
      });
    }
    
    const { error: insertError } = await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      role: messageData.role,
      content: messageData.content,
      message_type: messageData.type,
      user_id: currentUser.user.id,
      metadata: metadata
    });
    
    if (insertError) throw insertError;
  }, [conversationId]);

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
