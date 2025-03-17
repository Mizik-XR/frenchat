
import { Json } from './supabase';

export type AIProvider = 'openai' | 'anthropic' | 'mistral' | 'google' | 'ollama' | 'cohere' | 'local';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProviderOptions {
  streaming?: boolean;
  cache?: boolean;
  useRag?: boolean;
  systemPrompt?: string;
  contextLimit?: number;
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  is_pinned: boolean;
  is_archived: boolean;
  folder_id?: string;
  settings?: Json;
  created_at: string;
  updated_at: string;
  archive_date?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  conversationId: string;
  metadata?: {
    source?: string;
    timestamp?: string;
    model?: string;
    tokens?: number;
    quoted_message?: {
      id: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}
