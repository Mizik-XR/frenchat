
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
        };
      };
      // Ajoutez d'autres tables selon vos besoins
    };
  };
}
