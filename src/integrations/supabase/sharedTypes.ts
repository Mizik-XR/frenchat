
import type { Database } from './types';
import type { Json } from '@/types/database';

// Types partagés utilisés par client.ts et profileUtils.ts
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserWithProfile = {
  id: string;
  email?: string;
  profile?: Profile | null;
};

// Types pour la compatibilité avec les fonctions existantes
export interface EdgeFunctionResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    status?: number;
  } | null;
}

// Types pour les conversations et messages
export interface Conversation {
  id: string;
  title: string;
  createdAt: number; // Convertir en number pour la compatibilité TypeScript
  updatedAt: number; // Convertir en number pour la compatibilité TypeScript
  is_pinned?: boolean;
  is_archived?: boolean;
  folder_id?: string;
  settings?: any;
  user_id?: string;
}

export type MessageType = 'user' | 'assistant' | 'system';

export interface MessageMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  message_type: string;
  metadata?: MessageMetadata;
  user_id?: string;
}

// Typage pour les structures liées à RAG
export interface RagContext {
  context: string;
  source?: string;
  metadata?: any;
}
