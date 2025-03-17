
export type AIProvider = 'openai' | 'anthropic' | 'google-palm' | 'huggingface' | 'mistral' | 'local' | 'ollama' | 'openai-agent' | 'perplexity' | 'deepseek' | 'deepseek-v2' | 'internet-search' | 'gemma-3' | 'ollama-gemma';

export interface WebUIConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  stream?: boolean;
  systemPrompt?: string;
  useRag?: boolean;
  searchProvider?: string;
  maxTokens?: number;
  mode?: 'chat' | 'completion';
  allowAnonymous?: boolean;
  analysisMode?: AnalysisMode;
  useMemory?: boolean;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  conversationId: string;
  replyTo?: string;
  metadata?: MessageMetadata;
  quotedMessageId?: string;
  type?: string;
  context?: string;
}

export interface MessageMetadata {
  fileIds?: string[];
  fileUrls?: string[];
  model?: string;
  thinking?: string;
  rawResponse?: any;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages?: Message[];
  folderId?: string;
  metadata?: Record<string, any>;
  isPinned?: boolean;
  isArchived?: boolean;
  archiveDate?: Date;
  settings?: WebUIConfig;
}

export interface ConversationFolder {
  id: string;
  name: string;
  createdAt: number;
  parentId?: string;
  userId?: string;
  updatedAt?: number;
}

export type MessageType = 'text' | 'file' | 'image' | 'audio' | 'video' | 'document';

export type AnalysisMode = 'standard' | 'detailed' | 'summary' | 'extraction' | 'default';
