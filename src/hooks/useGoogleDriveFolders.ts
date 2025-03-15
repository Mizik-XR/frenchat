
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FolderPermissions } from '@/types/googleDrive';
import { useAuth } from '@/components/AuthProvider';
import { useGoogleDriveStatus } from './useGoogleDriveStatus';
import { useToast } from './use-toast';
import { usePersonalFolders } from './google-drive/usePersonalFolders';
import { useSharedFolders } from './google-drive/useSharedFolders';
import { useFolderPermissions } from './google-drive/useFolderPermissions';

// Export the Folder type instead of redefining it
export interface Folder {
  id: string;
  name: string;
  path: string;
  is_shared?: boolean;
  shared_with?: string[];
  permissions?: FolderPermissions;
  owner_email?: string;
  metadata?: Record<string, any>;
}

// Re-export the FolderPermissions type
export { type FolderPermissions } from '@/types/googleDrive';

export const useGoogleDriveFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [rootFolder, setRootFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isConnected } = useGoogleDriveStatus();
  const { toast } = useToast();
  
  // Use the separated hooks
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
  
  const { updateFolderPermissions } = useFolderPermissions();

  // Function to refresh all folder data
  const refreshFolders = useCallback(async () => {
    if (!user || !isConnected) {
      setFolders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Refresh both personal and shared folders
      await Promise.all([
        fetchFolders(),
        fetchSharedWithMe()
      ]);
      
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
    } catch (err) {
      console.error('Erreur lors de la récupération des dossiers:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les dossiers Google Drive",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isConnected, fetchFolders, fetchSharedWithMe, toast]);

  // Initial fetch
  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  // Combine personal and shared folders
  useEffect(() => {
    setFolders([...personalFolders, ...sharedFolders]);
  }, [personalFolders, sharedFolders]);

  return {
    folders,
    rootFolder,
    isLoading,
    error,
    refreshFolders,
    sharedFolders,
    isSharedLoading,
    updateFolderPermissions,
    stopSharingFolder,
    updateSharedWith
  };
};
