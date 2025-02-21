
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, WebUIConfig } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

export function useConversations() {
  const { data: conversations, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map((conv: any): Conversation => ({
        id: conv.id,
        title: conv.title,
        updatedAt: new Date(conv.updated_at),
        settings: conv.settings
      }));
    }
  });

  const createNewConversation = async (webUIConfig: WebUIConfig) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        title: "Nouvelle conversation",
        settings: webUIConfig,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer une nouvelle conversation",
        variant: "destructive"
      });
      throw error;
    }

    refetch();
    return data;
  };

  return {
    conversations,
    createNewConversation
  };
}
