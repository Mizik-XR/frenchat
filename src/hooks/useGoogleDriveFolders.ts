
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Folder, FolderPermissions } from '@/types/googleDrive';
import { usePersonalFolders } from './google-drive/usePersonalFolders';
import { useSharedFolders } from './google-drive/useSharedFolders';
import { useFolderPermissions } from './google-drive/useFolderPermissions';

export type { Folder, FolderPermissions };

export function useGoogleDriveFolders() {
  const { user } = useAuth();
  
  const { 
    folders, 
    isLoading,
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

  const refreshFolders = () => {
    fetchFolders();
    fetchSharedWithMe();
  };

  return { 
    folders, 
    sharedFolders,
    isLoading, 
    isSharedLoading,
    refreshFolders,
    updateFolderPermissions,
    stopSharingFolder,
    updateSharedWith
  };
}
