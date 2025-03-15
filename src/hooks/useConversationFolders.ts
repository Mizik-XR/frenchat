
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConversationFolder } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

export function useConversationFolders() {
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery({
    queryKey: ['conversation-folders'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('conversation_folders')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les dossiers",
          variant: "destructive"
        });
        throw error;
      }

      return data.map((folder: any): ConversationFolder => ({
        id: folder.id,
        name: folder.name,
        userId: folder.user_id,
        createdAt: new Date(folder.created_at).getTime(),
        updatedAt: new Date(folder.updated_at).getTime()
      }));
    }
  });

  const createFolder = useMutation({
    mutationFn: async (name: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('conversation_folders')
        .insert({
          name,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-folders'] });
      toast({
        title: "Dossier créé",
        description: "Le dossier a été créé avec succès"
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le dossier",
        variant: "destructive"
      });
    }
  });

  const updateFolder = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('conversation_folders')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-folders'] });
      toast({
        title: "Dossier mis à jour",
        description: "Le dossier a été renommé avec succès"
      });
    }
  });

  const deleteFolder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conversation_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-folders'] });
      toast({
        title: "Dossier supprimé",
        description: "Le dossier a été supprimé avec succès"
      });
    }
  });

  return {
    folders,
    createFolder: createFolder.mutate,
    updateFolder: updateFolder.mutate,
    deleteFolder: deleteFolder.mutate
  };
}
