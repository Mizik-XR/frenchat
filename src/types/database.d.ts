
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      indexing_progress: {
        Row: {
          id: string
          user_id: string
          total_files: number
          processed_files: number
          current_folder: string | null
          parent_folder: string | null
          depth: number
          last_processed_file: string | null
          status: 'running' | 'completed' | 'error'
          error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_files?: number
          processed_files?: number
          current_folder?: string | null
          parent_folder?: string | null
          depth?: number
          last_processed_file?: string | null
          status?: 'running' | 'completed' | 'error'
          error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_files?: number
          processed_files?: number
          current_folder?: string | null
          parent_folder?: string | null
          depth?: number
          last_processed_file?: string | null
          status?: 'running' | 'completed' | 'error'
          error?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      google_drive_folders: {
        Row: {
          id: string
          folder_id: string
          parent_folder_id: string | null
          name: string
          user_id: string
          path: string | null
          created_at: string
          updated_at: string
          last_synced: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          folder_id: string
          parent_folder_id?: string | null
          name: string
          user_id: string
          path?: string | null
          created_at?: string
          updated_at?: string
          last_synced?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          folder_id?: string
          parent_folder_id?: string | null
          name?: string
          user_id?: string
          path?: string | null
          created_at?: string
          updated_at?: string
          last_synced?: string | null
          metadata?: Json | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          is_first_login: boolean | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          is_first_login?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          is_first_login?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
      }
      service_configurations: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          service_type: string | null
          status: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          service_type?: string | null
          status?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          service_type?: string | null
          status?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_updated_at: {
        Args: {
          _tablename: string
          _row_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
