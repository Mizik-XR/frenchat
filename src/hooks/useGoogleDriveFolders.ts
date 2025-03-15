
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Folder, FolderPermissions } from '@/types/googleDrive';
import { useAuth } from '@/components/AuthProvider';
import { useGoogleDriveStatus } from './useGoogleDriveStatus';
import { useToast } from '@/hooks/use-toast';
import { useSharedFolders } from './google-drive/useSharedFolders';
import { usePersonalFolders } from './google-drive/usePersonalFolders';
import { useFolderPermissions } from './google-drive/useFolderPermissions';

// Re-export types for convenience with proper syntax for isolatedModules
export type { Folder, FolderPermissions };

export const useGoogleDriveFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [rootFolder, setRootFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isConnected } = useGoogleDriveStatus();
  const { toast } = useToast();
  
  // Import the hooks for different folder capabilities
  const { 
    folders: personalFolders, 
    isLoading: isPersonalLoading,
    fetchFolders,
    stopSharingFolder,
    updateSharedWith
  } = usePersonalFolders();
  
  const {
    sharedFolders,
    isLoading: isSharedLoading,
    fetchSharedWithMe
  } = useSharedFolders();
  
  const {
    updateFolderPermissions
  } = useFolderPermissions();

  // Function to refresh all folders
  const refreshFolders = useCallback(async () => {
    try {
      if (fetchFolders) await fetchFolders();
      if (fetchSharedWithMe) await fetchSharedWithMe();
      
      // Update the main folders list with both personal and shared folders
      setFolders([...personalFolders, ...sharedFolders]);
    } catch (err) {
      console.error('Error refreshing folders:', err);
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir la liste des dossiers",
        variant: "destructive",
      });
    }
  }, [fetchFolders, fetchSharedWithMe, personalFolders, sharedFolders, toast]);

  useEffect(() => {
    const fetchRootFolder = async () => {
      if (!user || !isConnected) {
        setFolders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Attempt to fetch root folder info
        const { data: rootFolderData, error: rootError } = await supabase
          .functions.invoke('get-google-drive-root', {
            body: { userId: user.id }
          });

        if (!rootError && rootFolderData) {
          setRootFolder({
            id: rootFolderData.id || 'root',
            name: rootFolderData.name || 'Mon Google Drive',
            path: '/',
            metadata: {
              is_root: true,
              total_files: rootFolderData.totalFiles || 0
            }
          });
        }
        
        // Update the main folders list with both personal and shared folders
        setFolders([...personalFolders, ...sharedFolders]);
      } catch (err) {
        console.error('Erreur lors de la récupération des dossiers:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRootFolder();
  }, [user, isConnected, personalFolders, sharedFolders]);

  return {
    folders,
    rootFolder,
    isLoading,
    error,
    refreshFolders,
    sharedFolders,
    isSharedLoading,
    // Add the functions from other hooks
    updateFolderPermissions,
    stopSharingFolder,
    updateSharedWith
  };
};
