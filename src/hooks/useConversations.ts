import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/integrations/supabase/sharedTypes";
import { toast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { WebUIConfig } from "@/types/chat";
// Importer les fonctions de conversion
import { webUIConfigToJson } from '@/integrations/supabase/typesCompatibility';

interface UseConversationsProps {
  initialSettings: WebUIConfig;
}

export function useConversations({ initialSettings }: UseConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthSession();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("chat_conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error fetching conversations:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les conversations.",
            variant: "destructive",
          });
        }

        if (data) {
          // Convertir les dates en nombres
          const formattedConversations = data.map(conversation => ({
            ...conversation,
            createdAt: new Date(conversation.created_at).getTime(),
            updatedAt: new Date(conversation.updated_at).getTime()
          }));
          setConversations(formattedConversations);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Realtime subscription
    const channel = supabase
      .channel('public:chat_conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, (payload) => {
        if (payload.new) {
          fetchConversations();
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    };
  }, [user]);

  const createConversation = async (title: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('User not authenticated');
      }

      const { error: insertError } = await supabase.from('chat_conversations').insert({
        title,
        settings: webUIConfigToJson(initialSettings),
        user_id: currentUser.user.id
      });

      if (insertError) {
        console.error("Error creating conversation:", insertError);
        toast({
          title: "Erreur",
          description: "Impossible de créer la conversation.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Conversation créée avec succès.",
        });
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la conversation.",
        variant: "destructive",
      });
    }
  };

  return {
    conversations,
    isLoading,
    createConversation,
  };
}
