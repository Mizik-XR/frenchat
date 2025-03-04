
import { FolderPermissions } from "@/types/googleDrive";

// Fonction pour convertir un JSON en FolderPermissions
export const convertToFolderPermissions = (data: any): FolderPermissions => {
  const defaultPermissions: FolderPermissions = {
    can_read: true,
    can_query: true,
    can_reindex: false
  };

  if (!data || typeof data !== 'object') {
    return defaultPermissions;
  }

  return {
    can_read: typeof data.can_read === 'boolean' ? data.can_read : defaultPermissions.can_read,
    can_query: typeof data.can_query === 'boolean' ? data.can_query : defaultPermissions.can_query,
    can_reindex: typeof data.can_reindex === 'boolean' ? data.can_reindex : defaultPermissions.can_reindex
  };
};
