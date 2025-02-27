
// Ajout de la définition de type Json si elle n'existe pas déjà
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_ai_configs: {
        Row: {
          id: string;
          provider: string;
          model_name: string;
          api_key: string;
          api_endpoint: string;
          config: Json;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          model_name?: string;
          api_key?: string;
          api_endpoint?: string;
          config?: Json;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          model_name?: string;
          api_key?: string;
          api_endpoint?: string;
          config?: Json;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          template_type: string;
          content_structure: Json;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          template_type: string;
          content_structure: Json;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          template_type?: string;
          content_structure?: Json;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      uploaded_documents: {
        Row: {
          id: string;
          title: string;
          file_path: string;
          file_type: string;
          mime_type: string;
          size: number;
          metadata: Json;
          user_id: string;
          created_at: string;
          updated_at: string;
          content: string | null;
          preview_url: string | null;
          content_hash: string | null; // Ajout du champ content_hash manquant
        };
        Insert: {
          id?: string;
          title: string;
          file_path: string;
          file_type: string;
          mime_type: string;
          size: number;
          metadata?: Json;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          content?: string | null;
          preview_url?: string | null;
          content_hash?: string | null; // Ajout du champ content_hash
        };
        Update: {
          id?: string;
          title?: string;
          file_path?: string;
          file_type?: string;
          mime_type?: string;
          size?: number;
          metadata?: Json;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          content?: string | null;
          preview_url?: string | null;
          content_hash?: string | null; // Ajout du champ content_hash
        };
      };
      indexing_progress: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          total_files: number | null;
          processed_files: number | null;
          current_folder: string | null;
          parent_folder: string | null;
          last_processed_file: string | null;
          depth: number | null;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          total_files?: number | null;
          processed_files?: number | null;
          current_folder?: string | null;
          parent_folder?: string | null;
          last_processed_file?: string | null;
          depth?: number | null;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          total_files?: number | null;
          processed_files?: number | null;
          current_folder?: string | null;
          parent_folder?: string | null;
          last_processed_file?: string | null;
          depth?: number | null;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Autres tables
    };
  };
}
