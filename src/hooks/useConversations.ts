
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/integrations/supabase/sharedTypes";
import { toast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { WebUIConfig } from "@/types/chat";
// Importer les fonctions de conversion
import { webUIConfigToJson, normalizeDate } from '@/integrations/supabase/typesCompatibility';

interface UseConversationsProps {
  initialSettings?: WebUIConfig;
}

export function useConversations(props?: UseConversationsProps) {
  const initialSettings = props?.initialSettings;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const { user } = useAuthSession();

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

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
          createdAt: normalizeDate(conversation.created_at),
          updatedAt: normalizeDate(conversation.updated_at)
        }));
        setConversations(formattedConversations);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();

    // Realtime subscription
    if (user) {
      const channel = supabase
        .channel('public:chat_conversations')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'chat_conversations',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchConversations();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchConversations]);

  const createConversation = useCallback(async (title: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('User not authenticated');
      }

      // Préparer les settings s'ils sont fournis
      let settings = null;
      if (initialSettings) {
        settings = webUIConfigToJson(initialSettings);
      }

      // Insérer la conversation
      const { data, error: insertError } = await supabase
        .from('chat_conversations')
        .insert({
          title,
          settings,
          user_id: currentUser.user.id
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating conversation:", insertError);
        toast({
          title: "Erreur",
          description: "Impossible de créer la conversation.",
          variant: "destructive",
        });
        return null;
      } else {
        toast({
          title: "Succès",
          description: "Conversation créée avec succès.",
        });
        
        // Formater la nouvelle conversation
        if (data) {
          const newConversation = {
            ...data,
            createdAt: normalizeDate(data.created_at),
            updatedAt: normalizeDate(data.updated_at)
          };
          
          // Mettre à jour la liste des conversations
          setConversations(prev => [newConversation, ...prev]);
          
          // Définir comme conversation active
          setActiveConversation(newConversation);
          
          return newConversation;
        }
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la conversation.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, initialSettings]);

  const updateConversation = useCallback(async (params: {
    id: string;
    title?: string;
    is_pinned?: boolean;
    is_archived?: boolean;
    folder_id?: string | null;
  }) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update(params)
        .eq('id', params.id);

      if (error) {
        console.error("Error updating conversation:", error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la conversation.",
          variant: "destructive",
        });
        return false;
      }

      // Mettre à jour la liste locale des conversations
      setConversations(prev => prev.map(conv => 
        conv.id === params.id ? { ...conv, ...params } : conv
      ));

      // Mettre à jour la conversation active si nécessaire
      if (activeConversation && activeConversation.id === params.id) {
        setActiveConversation(prev => prev ? { ...prev, ...params } : null);
      }

      return true;
    } catch (error) {
      console.error("Error updating conversation:", error);
      return false;
    }
  }, [activeConversation]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting conversation:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la conversation.",
          variant: "destructive",
        });
        return false;
      }

      // Mettre à jour la liste locale des conversations
      setConversations(prev => prev.filter(conv => conv.id !== id));

      // Réinitialiser la conversation active si nécessaire
      if (activeConversation && activeConversation.id === id) {
        setActiveConversation(null);
      }

      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }
  }, [activeConversation]);

  return {
    conversations,
    isLoading,
    createConversation,
    activeConversation,
    setActiveConversation,
    updateConversation,
    deleteConversation,
    fetchConversations
  };
}

// Export des hooks dérivés pour la compatibilité avec le code existant
export function useCreateConversation() {
  const { createConversation, isLoading } = useConversations();
  return {
    mutate: createConversation,
    isLoading
  };
}

export function useUpdateConversation() {
  const { updateConversation, isLoading } = useConversations();
  return {
    mutate: updateConversation,
    isLoading
  };
}

export function useDeleteConversation() {
  const { deleteConversation, isLoading } = useConversations();
  return {
    mutate: deleteConversation,
    isLoading
  };
}
