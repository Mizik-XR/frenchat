
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, WebUIConfig } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

export function useConversations() {
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map((conv: any): Conversation => ({
        id: conv.id,
        title: conv.title,
        updatedAt: new Date(conv.updated_at),
        folderId: conv.folder_id,
        isPinned: conv.is_pinned,
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

    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    return data;
  };

  const updateConversation = useMutation({
    mutationFn: async (params: { 
      id: string; 
      title?: string; 
      folderId?: string | null;
      isPinned?: boolean;
    }) => {
      const { error } = await supabase
        .from('chat_conversations')
        .update({
          title: params.title,
          folder_id: params.folderId,
          is_pinned: params.isPinned
        })
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversation mise à jour",
        description: "La conversation a été mise à jour avec succès"
      });
    }
  });

  return {
    conversations,
    createNewConversation,
    updateConversation: updateConversation.mutate
  };
}
