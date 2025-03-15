
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, WebUIConfig } from "@/types/chat";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export function useConversations() {
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const { data: conversations, isLoading } = useQuery({
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
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        folderId: conv.folder_id,
        isPinned: conv.is_pinned,
        isArchived: conv.is_archived,
        archiveDate: conv.archive_date ? new Date(conv.archive_date) : undefined,
        settings: conv.settings
      }));
    }
  });

  const createNewConversation = async (webUIConfig?: WebUIConfig) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const defaultConfig: WebUIConfig = {
      model: 'huggingface',
      provider: 'huggingface',
      temperature: 0.7,
      maxTokens: 500,
      analysisMode: 'default',
      useMemory: false
    };

    const config = webUIConfig || defaultConfig;

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        title: "Nouvelle conversation",
        settings: config,
        user_id: user.user.id,
        is_archived: false
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

  const updateConversationMetadata = async (id: string, updates: { title?: string }) => {
    const { error } = await supabase
      .from('chat_conversations')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    
    // Refresh conversations data after update
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    
    return true;
  };

  const updateConversation = useMutation({
    mutationFn: async (params: { 
      id: string; 
      title?: string; 
      folderId?: string | null;
      isPinned?: boolean;
      isArchived?: boolean;
    }) => {
      const updates: any = {};
      if (params.title !== undefined) updates.title = params.title;
      if (params.folderId !== undefined) updates.folder_id = params.folderId;
      if (params.isPinned !== undefined) updates.is_pinned = params.isPinned;
      if (params.isArchived !== undefined) {
        updates.is_archived = params.isArchived;
        updates.archive_date = params.isArchived ? new Date() : null;
      }

      const { error } = await supabase
        .from('chat_conversations')
        .update(updates)
        .eq('id', params.id);

      if (error) throw error;

      // Afficher un toast de confirmation approprié
      const message = params.isArchived !== undefined
        ? params.isArchived
          ? "Conversation archivée"
          : "Conversation restaurée"
        : "Conversation mise à jour";

      toast({
        title: "Succès",
        description: message
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la conversation",
        variant: "destructive"
      });
    }
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      // Supprimer d'abord les messages associés à cette conversation
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', id);

      if (messagesError) throw messagesError;

      // Ensuite supprimer la conversation elle-même
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversation supprimée",
        description: "La conversation a été supprimée avec succès"
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive"
      });
    }
  });

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    isLoading,
    createNewConversation,
    updateConversationMetadata,
    updateConversation: updateConversation.mutate,
    deleteConversation: deleteConversation.mutate
  };
}
