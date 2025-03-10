
// Types utilisés dans l'indexation des fichiers Google Drive

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  size?: number;
}

export interface IndexingOptions {
  userId: string;
  folderId: string;
  recursive?: boolean;
  maxDepth?: number;
  batchSize?: number;
  parentFolderId?: string;
  currentDepth?: number;
}

export interface IndexingProgress {
  id: string;
  user_id: string;
  current_folder: string;
  parent_folder?: string;
  status: 'running' | 'completed' | 'error';
  depth: number;
  processed_files: number;
  total_files: number;
  last_processed_file: string | null;
  error: string | null;
}
