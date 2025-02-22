export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          client_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          client_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          client_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      archived_documents: {
        Row: {
          archived_at: string | null
          client_id: string | null
          content: string | null
          created_at: string | null
          document_id: string
          document_type: string
          id: string
          metadata: Json | null
          original_id: string
          title: string
        }
        Insert: {
          archived_at?: string | null
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          document_id: string
          document_type: string
          id?: string
          metadata?: Json | null
          original_id: string
          title: string
        }
        Update: {
          archived_at?: string | null
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          document_id?: string
          document_type?: string
          id?: string
          metadata?: Json | null
          original_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "archived_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          archive_date: string | null
          created_at: string | null
          folder_id: string | null
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          settings: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archive_date?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          settings?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archive_date?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          settings?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "conversation_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          context: string | null
          conversation_id: string
          created_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          context?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          context?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_embeddings: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          embedding: string
          id: string
          updated_at: string | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          embedding: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_metadata"
            referencedColumns: ["document_id"]
          },
        ]
      }
      document_embeddings_versions: {
        Row: {
          content: string
          created_at: string | null
          document_id: string
          embedding: string
          id: string
          metadata: Json | null
          version: number
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id: string
          embedding: string
          id?: string
          metadata?: Json | null
          version: number
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string
          id?: string
          metadata?: Json | null
          version?: number
        }
        Relationships: []
      }
      document_metadata: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          name: string
          owner: string
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          name: string
          owner: string
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          name?: string
          owner?: string
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          document_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string | null
          content: string | null
          created_at: string | null
          document_type: string
          external_id: string | null
          id: string
          metadata: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          document_type: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          document_type?: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      embeddings_cache: {
        Row: {
          compression_enabled: boolean | null
          created_at: string | null
          expires_at: string
          id: string
          key: string
          value: Json
        }
        Insert: {
          compression_enabled?: boolean | null
          created_at?: string | null
          expires_at: string
          id?: string
          key: string
          value: Json
        }
        Update: {
          compression_enabled?: boolean | null
          created_at?: string | null
          expires_at?: string
          id?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          created_at: string | null
          document_id: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          model: string
          prompt: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          model: string
          prompt: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          model?: string
          prompt?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_configs: {
        Row: {
          api_key: string
          client_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          client_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          client_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      oauth_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          cache_hit: boolean | null
          created_at: string | null
          duration: number
          error: string | null
          id: string
          operation: string
          success: boolean
          timestamp: string
        }
        Insert: {
          cache_hit?: boolean | null
          created_at?: string | null
          duration: number
          error?: string | null
          id?: string
          operation: string
          success: boolean
          timestamp: string
        }
        Update: {
          cache_hit?: boolean | null
          created_at?: string | null
          duration?: number
          error?: string | null
          id?: string
          operation?: string
          success?: boolean
          timestamp?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_first_login: boolean | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_first_login?: boolean | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_first_login?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      service_configurations: {
        Row: {
          client_id: string | null
          config: Json
          created_at: string
          id: string
          is_active: boolean | null
          oauth_connected: boolean | null
          service_type: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          oauth_connected?: boolean | null
          service_type: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          oauth_connected?: boolean | null
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_configurations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          client_id: string | null
          created_at: string | null
          google_api_key: string | null
          google_client_id: string | null
          id: string
          microsoft_client_id: string | null
          microsoft_tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          google_api_key?: string | null
          google_client_id?: string | null
          id?: string
          microsoft_client_id?: string | null
          microsoft_tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          google_api_key?: string | null
          google_client_id?: string | null
          id?: string
          microsoft_client_id?: string | null
          microsoft_tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      system_reports: {
        Row: {
          cache_stats: Json
          created_at: string | null
          id: string
          metrics_summary: Json
          recent_errors: Json
          timestamp: string
        }
        Insert: {
          cache_stats: Json
          created_at?: string | null
          id?: string
          metrics_summary: Json
          recent_errors: Json
          timestamp: string
        }
        Update: {
          cache_stats?: Json
          created_at?: string | null
          id?: string
          metrics_summary?: Json
          recent_errors?: Json
          timestamp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_documents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      clean_old_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      restore_embedding_version: {
        Args: {
          p_document_id: string
          p_version: number
        }
        Returns: boolean
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
      document_type: "google_drive" | "teams" | "generated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
