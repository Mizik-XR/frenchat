
import type { Json } from './types';
import type { Database } from './types';

/**
 * Adaptateurs de types pour convertir entre les types Supabase et les types de l'application
 */

export type DbChatConversation = Database['public']['Tables']['chat_conversations']['Row'];
export type DbChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type DbServiceConfiguration = Database['public']['Tables']['service_configurations']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbResponseCache = Database['public']['Tables']['response_cache']['Row'];

// Type de conversation pour l'UI avec camelCase
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isPinned: boolean;
  archiveDate: string | null;
  folderId: string | null;
  userId: string;
  settings: any;
}

// Type de message pour l'UI avec camelCase
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  role: string;
  messageType: string;
  context?: string | null;
  metadata?: any | null;
  createdAt: string;
  userId: string;
}

// Interface pour les métadonnées de message avec index signature
export interface MessageMetadata {
  [key: string]: Json;
}

// Type pour la configuration de l'interface Web avec index signature
export interface WebUIConfig {
  [key: string]: Json;
}

// Adaptateur pour convertir de snake_case à camelCase
export function adaptConversation(dbConversation: DbChatConversation): Conversation {
  return {
    id: dbConversation.id,
    title: dbConversation.title,
    createdAt: dbConversation.created_at || new Date().toISOString(),
    updatedAt: dbConversation.updated_at || new Date().toISOString(),
    isArchived: dbConversation.is_archived || false,
    isPinned: dbConversation.is_pinned || false,
    archiveDate: dbConversation.archive_date,
    folderId: dbConversation.folder_id,
    userId: dbConversation.user_id,
    settings: dbConversation.settings
  };
}

// Adaptateur inverse pour convertir de camelCase à snake_case
export function convertToDbConversation(conversation: Conversation): Partial<DbChatConversation> {
  return {
    id: conversation.id,
    title: conversation.title,
    created_at: conversation.createdAt,
    updated_at: conversation.updatedAt,
    is_archived: conversation.isArchived,
    is_pinned: conversation.isPinned,
    archive_date: conversation.archiveDate,
    folder_id: conversation.folderId,
    user_id: conversation.userId,
    settings: conversation.settings as Json
  };
}

// Adaptateur pour les messages
export function adaptChatMessage(dbMessage: DbChatMessage): ChatMessage {
  return {
    id: dbMessage.id,
    conversationId: dbMessage.conversation_id,
    content: dbMessage.content,
    role: dbMessage.role,
    messageType: dbMessage.message_type,
    context: dbMessage.context,
    metadata: dbMessage.metadata,
    createdAt: dbMessage.created_at || new Date().toISOString(),
    userId: dbMessage.user_id
  };
}

// Adaptateur inverse pour les messages
export function convertToDbChatMessage(message: ChatMessage): Partial<DbChatMessage> {
  return {
    id: message.id,
    conversation_id: message.conversationId,
    content: message.content,
    role: message.role,
    message_type: message.messageType,
    context: message.context,
    metadata: message.metadata as Json,
    created_at: message.createdAt,
    user_id: message.userId
  };
}

// Helper pour convertir un type quelconque en Json (pour Supabase)
export function toJson<T>(data: T): Json {
  return data as unknown as Json;
}

// Helper pour convertir WebUIConfig en Json
export function webUIConfigToJson(config: WebUIConfig): Json {
  return config as unknown as Json;
}

export default {
  adaptConversation,
  convertToDbConversation,
  adaptChatMessage,
  convertToDbChatMessage,
  toJson,
  webUIConfigToJson
};
