
export interface SupportedProvider {
  provider_code: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ServiceProvider {
  id: string;
  provider_type: string;
  user_id: string;
  config: Record<string, any>;
  status: 'disconnected' | 'connected' | 'error';
  last_sync: string | null;
  error_message: string | null;
}

export interface IndexedDocument {
  id: string;
  user_id: string;
  provider_type: string;
  external_id: string | null;
  title: string;
  file_path: string;
  mime_type: string;
  file_size: number | null;
  parent_folder_id: string | null;
  metadata: Record<string, any>;
  content_text: string | null;
  status: 'pending' | 'indexed' | 'error';
  created_at: string;
  updated_at: string;
  last_indexed: string | null;
}

export interface DocumentProvider {
  code: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  connectComponent: React.ComponentType<{
    onConnect: () => void;
    isConnected: boolean;
  }>;
}
