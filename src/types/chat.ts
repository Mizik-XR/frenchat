
// Vérifiez si ce fichier existe, sinon il sera créé

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'document';
export type AnalysisMode = 'default' | 'analysis' | 'summary' | 'action';

export interface MessageMetadata {
  provider?: string;
  analysisMode?: string;
  replyTo?: {
    id: string;
    content: string;
    role: MessageRole;
  };
  aiService?: {
    type: 'local' | 'cloud' | 'browser';
    endpoint?: string;
  };
  [key: string]: any;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  context?: string | null;
  metadata?: MessageMetadata;
  conversationId: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  folderId?: string | null;
  pinned?: boolean;
  isArchived?: boolean;
  archiveDate?: Date;
}

export interface WebUIConfig {
  model: AIProvider;
  maxTokens: number;
  temperature: number;
  useMemory: boolean;
  analysisMode: AnalysisMode;
  showSources?: boolean;
  streamResponse?: boolean;
}

export type AIProvider = 'huggingface' | 'openai' | 'anthropic' | 'gemini' | 'perplexity' | 'internet-search';

export interface ConversationFolder {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
