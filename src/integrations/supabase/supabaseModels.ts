
/**
 * supabaseModels.ts
 * 
 * Ce fichier contient les types et interfaces pour les modèles Supabase.
 * Il est utilisé pour éviter les dépendances circulaires dans l'application.
 */

import { Database } from "./types";

// Types de base
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Interfaces utilisateurs
export interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  is_first_login?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  client_id?: string | null;
}

// Types pour les services
export interface ServiceConfiguration {
  id: string;
  service_type: string;
  config: any;
  status: 'configured' | 'not_configured' | 'error';
  error_message?: string | null;
  last_tested_at?: string | null;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  oauth_connected?: boolean;
}

// Types pour les conversations de chat
export interface ChatConversation {
  id: string;
  title: string;
  user_id: string;
  folder_id?: string | null;
  is_pinned?: boolean;
  is_archived?: boolean;
  archive_date?: string | null;
  created_at?: string;
  updated_at?: string;
  settings?: any;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  content: string;
  context?: string | null;
  message_type: string;
  created_at?: string;
  metadata?: any;
}

// Types pour les documents
export interface Document {
  id: string;
  title: string;
  content?: string | null;
  document_type: string;
  user_id?: string | null;
  client_id?: string | null;
  external_id?: string | null;
  created_at?: string;
  updated_at?: string;
  metadata?: any;
  template_type?: string | null;
  generated_content?: any;
}

// Types pour l'indexation
export interface IndexingProgress {
  id: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  processed_files?: number | null;
  total_files?: number | null;
  current_folder?: string | null;
  parent_folder?: string | null;
  last_processed_file?: string | null;
  error?: string | null;
  created_at: string;
  updated_at: string;
  depth?: number | null;
}

// Types pour les configurations AI
export interface AIModelConfiguration {
  id: string;
  user_id: string;
  provider_type: string;
  model_name?: string | null;
  configuration?: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Types pour OAuth
export interface OAuthToken {
  id: string;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token?: string | null;
  expires_at?: string | null;
  provider_user_info?: any;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// Types pour les embeddings
export interface DocumentEmbedding {
  id: string;
  document_id: string;
  content: string;
  embedding: string;
  chunk_index: number;
  created_at?: string;
  updated_at?: string;
}

// Types pour Google Drive
export interface GoogleDriveFolder {
  id: string;
  user_id: string;
  folder_id: string;
  name: string;
  parent_folder_id?: string | null;
  path?: string | null;
  is_shared?: boolean;
  shared_with?: string[] | null;
  permissions?: any;
  metadata?: any;
  last_synced?: string | null;
  created_at: string;
  updated_at: string;
}

// Types pour les utilisateurs et les notifications
export interface UserNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read?: boolean;
  data?: any;
  created_at: string;
  expires_at?: string | null;
}

// Fonctions utilitaires pour les profils
export interface ProfileUtils {
  handleProfileQuery: (userId: string) => Promise<{ data: UserProfile | null, error: any }>;
  checkSupabaseConnection: () => Promise<boolean>;
}

// Fonctions utilitaires pour l'authentification
export interface AuthUtils {
  preloadSession: () => Promise<{ session: any }>;
}

// Utilitaires pour convertir les types Supabase en types d'application
export function mapDatabaseUserToProfile<T extends Record<string, any>>(user: T): UserProfile {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    is_first_login: user.is_first_login,
    created_at: user.created_at,
    updated_at: user.updated_at,
    client_id: user.client_id
  };
}
