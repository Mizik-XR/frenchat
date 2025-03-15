
export interface IndexingProgressState {
  progress: number;
  isIndexing: boolean;
  indexed: number;
  total: number;
  error: string | null;
  lastUpdate: number;
  indexingProgress?: number;
  startIndexing?: (folderId: string, options?: Record<string, any>) => Promise<string | null>;
}

export interface IndexingProgress {
  id?: string;
  status: 'running' | 'completed' | 'error' | 'paused' | 'unknown';
  total: number;
  processed: number;
  current_folder?: string;
  error?: string | null;
  updated_at?: string;
  user_id?: string;
  folder_id?: string;
}
