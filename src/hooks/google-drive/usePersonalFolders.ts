
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Folder } from '@/types/googleDrive';
import { convertToFolderPermissions } from '@/utils/folderUtils';

export function usePersonalFolders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction optimisée pour récupérer les dossiers personnels
  const fetchFolders = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('google_drive_folders')
        .select('folder_id, name, path, metadata, is_shared, shared_with, permissions')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      
      setFolders(data.map(folder => ({
        id: folder.folder_id,
        name: folder.name,
        path: folder.path || folder.name,
        metadata: folder.metadata as Record<string, any>,
        is_shared: folder.is_shared,
        shared_with: folder.shared_with,
        permissions: convertToFolderPermissions(folder.permissions)
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dossiers Google Drive",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Fonction pour arrêter de partager un dossier
  const stopSharingFolder = async (folderId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('google_drive_folders')
        .update({ 
          is_shared: false,
          shared_with: null 
        })
        .eq('folder_id', folderId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Partage désactivé",
        description: "Le dossier n'est plus partagé",
      });
      
      // Actualiser les listes
      fetchFolders();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la désactivation du partage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de désactiver le partage du dossier",
        variant: "destructive",
      });
      return false;
    }
  };

  // Fonction pour mettre à jour la liste des personnes avec qui un dossier est partagé
  const updateSharedWith = async (folderId: string, emails: string[]) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('google_drive_folders')
        .update({ 
          is_shared: emails.length > 0,
          shared_with: emails.length > 0 ? emails : null 
        })
        .eq('folder_id', folderId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Partage mis à jour",
        description: `Le dossier est maintenant partagé avec ${emails.length} personne(s)`,
      });
      
      // Actualiser les listes
      fetchFolders();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du partage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le partage du dossier",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return { 
    folders,
    isLoading,
    fetchFolders,
    stopSharingFolder,
    updateSharedWith
  };
}
