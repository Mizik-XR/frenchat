
import { useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FolderPermissions } from '@/types/googleDrive';
import { convertToFolderPermissions } from '@/utils/folderUtils';

export function useFolderPermissions() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Mise à jour des permissions d'un dossier partagé
  const updateFolderPermissions = useCallback(async (folderId: string, permissions: Partial<FolderPermissions>) => {
    if (!user) return false;
    
    try {
      const { data: folderData, error: folderError } = await supabase
        .from('google_drive_folders')
        .select('permissions')
        .eq('folder_id', folderId)
        .single();
      
      if (folderError) throw folderError;
      
      // Fusion des permissions existantes avec les nouvelles
      const currentPermissions = convertToFolderPermissions(folderData.permissions);
      const updatedPermissions = {
        ...currentPermissions,
        ...permissions
      };
      
      const { error } = await supabase
        .from('google_drive_folders')
        .update({ permissions: updatedPermissions })
        .eq('folder_id', folderId);
      
      if (error) throw error;
      
      toast({
        title: "Permissions mises à jour",
        description: "Les permissions du dossier ont été mises à jour avec succès",
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions du dossier",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  return { updateFolderPermissions };
}
