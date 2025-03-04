
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Folder } from '@/types/googleDrive';
import { convertToFolderPermissions } from '@/utils/folderUtils';

export function useSharedFolders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sharedFolders, setSharedFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour récupérer les dossiers partagés avec l'utilisateur
  const fetchSharedWithMe = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      // Utilise l'index GIN sur shared_with pour optimiser la recherche
      const { data, error } = await supabase
        .from('google_drive_folders')
        .select('id, folder_id, name, path, metadata, shared_with, permissions, user_id')
        .neq('user_id', user.id)
        .eq('is_shared', true)
        .filter('shared_with', 'cs', `{${user.email}}`)
        .order('name');

      if (error) throw error;
      
      // Récupérer les emails des propriétaires
      const ownerIds = [...new Set(data.map(folder => folder.user_id))];
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', ownerIds);

      if (ownerError) throw ownerError;
      
      // Créer un dictionnaire d'ID -> email
      const ownerEmailMap = (ownerData || []).reduce((acc, owner) => {
        acc[owner.id] = owner.email;
        return acc;
      }, {} as Record<string, string>);
      
      setSharedFolders(data.map(folder => ({
        id: folder.folder_id,
        name: folder.name,
        path: folder.path || folder.name,
        metadata: folder.metadata as Record<string, any>,
        is_shared: true,
        shared_with: folder.shared_with,
        permissions: convertToFolderPermissions(folder.permissions),
        owner_email: ownerEmailMap[folder.user_id]
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers partagés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dossiers partagés",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSharedWithMe();
  }, [fetchSharedWithMe]);

  return {
    sharedFolders,
    isLoading,
    fetchSharedWithMe
  };
}
