
import { Database } from "@/integrations/supabase/types";

export type IndexingProgress = Database['public']['Tables']['indexing_progress']['Row'];

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
