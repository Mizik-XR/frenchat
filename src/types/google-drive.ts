
// Puisque la table indexing_progress n'est pas correctement générée dans les types Supabase,
// nous définissons explicitement l'interface
export interface IndexingProgress {
  id: string;
  user_id: string;
  total_files: number;
  processed_files: number;
  current_folder: string | null;
  status: 'running' | 'completed' | 'error';
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleOAuthConfig {
  configured: boolean;
  client_id?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
}

export interface GoogleDriveConnectionProps {
  onFolderSelect: (folderId: string) => Promise<void>;
}
