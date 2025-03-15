
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Folder } from '@/types/googleDrive';
import { useAuth } from '@/components/AuthProvider';
import { useGoogleDriveStatus } from './useGoogleDriveStatus';

export interface Folder {
  id: string;
  name: string;
  path: string;
  is_shared?: boolean;
  shared_with?: string[];
  metadata?: Record<string, any>;
}

export const useGoogleDriveFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [rootFolder, setRootFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isConnected } = useGoogleDriveStatus();

  useEffect(() => {
    const fetchFolders = async () => {
      if (!user || !isConnected) {
        setFolders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch folders from stored data
        const { data: storedFolders, error: fetchError } = await supabase
          .from('google_drive_folders')
          .select('*')
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;

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

        // Transform stored folders to expected format
        const formattedFolders: Folder[] = storedFolders?.map(folder => ({
          id: folder.folder_id,
          name: folder.name,
          path: folder.path,
          is_shared: folder.is_shared,
          shared_with: folder.shared_with,
          metadata: folder.metadata
        })) || [];

        setFolders(formattedFolders);
      } catch (err) {
        console.error('Erreur lors de la récupération des dossiers:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, [user, isConnected]);

  return {
    folders,
    rootFolder,
    isLoading,
    error
  };
};
