
export interface FolderPermissions {
  can_read: boolean;
  can_query: boolean;
  can_reindex: boolean;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  metadata?: Record<string, any>;
  is_shared?: boolean;
  shared_with?: string[];
  permissions?: FolderPermissions;
  owner_email?: string;
}
