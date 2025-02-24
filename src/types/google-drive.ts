
export interface GoogleOAuthConfig {
  configured: boolean;
  client_id?: string;
}

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

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
}
