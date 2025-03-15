
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { MessageMetadata } from "@/types/chat";

type MessageRole = "user" | "assistant" | "system";
type MessageType = "text" | "document" | "image" | "chart";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  createdAt: Date;
  metadata?: MessageMetadata;
  conversationId?: string;
  timestamp?: Date;
  replyTo?: string;
  quotedMessageId?: string;
}

export const useChatMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch messages for the conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Transform the data to match the ChatMessage type
        const formattedMessages = data.map((message) => ({
          id: message.id,
          role: message.role as MessageRole,
          content: message.content,
          type: message.message_type as MessageType,
          createdAt: new Date(message.created_at),
          metadata: message.metadata as MessageMetadata,
          conversationId: message.conversation_id,
          timestamp: new Date(message.created_at),
          replyTo: message.quoted_message_id || undefined,
          quotedMessageId: message.quoted_message_id || undefined
        }));

        setMessages(formattedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch messages"));
        toast.error("Erreur lors du chargement des messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const messageSubscription = supabase
      .channel(`chat_messages:conversation_id=eq.${conversationId}`)
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          const newMessage = payload.new;
          setMessages((prev) => [
            ...prev,
            {
              id: newMessage.id,
              role: newMessage.role as MessageRole,
              content: newMessage.content,
              type: newMessage.message_type as MessageType,
              createdAt: new Date(newMessage.created_at),
              metadata: newMessage.metadata as MessageMetadata,
              conversationId: newMessage.conversation_id,
              timestamp: new Date(newMessage.created_at),
              replyTo: newMessage.quoted_message_id || undefined,
              quotedMessageId: newMessage.quoted_message_id || undefined
            },
          ]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [conversationId, user]);

  // Send a message
  const sendMessage = useCallback(async (content: string, quotedMessageId?: string) => {
    if (!conversationId || !user) {
      toast.error("Impossible d'envoyer le message");
      return;
    }

    setIsLoading(true);

    try {
      // Insert the message into the database
      const { error: insertError } = await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content,
        message_type: "text",
        user_id: user.id,
        quoted_message_id: quotedMessageId || null
      });

      if (insertError) throw insertError;

      // You can add AI response logic here
      // This is a placeholder for demonstration
      setTimeout(async () => {
        const aiResponse = "This is a placeholder AI response. You would typically call your AI service here.";
        
        const { error: aiInsertError } = await supabase.from("chat_messages").insert({
          conversation_id: conversationId,
          role: "assistant",
          content: aiResponse,
          message_type: "text",
          user_id: user.id,
          metadata: {
            provider: "placeholder",
            aiService: {
              type: "local",
              endpoint: "localhost",
              actualServiceUsed: "local"
            }
          } as MessageMetadata
        });

        if (aiInsertError) {
          console.error("Error inserting AI response:", aiInsertError);
        }
      }, 1000);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err : new Error("Failed to send message"));
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, user]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};
