
export type AIProvider = 
  | 'huggingface' 
  | 'mistral' 
  | 'ollama'
  | 'ollama-gemma'
  | 'deepseek'
  | 'deepseek-v2'
  | 'internet-search'
  | 'gemma-3'
  | 'google'
  | 'openai';

export type MessageType = 'text' | 'document' | 'image' | 'chart';

export type AnalysisMode = 'default' | 'analysis' | 'summary' | 'action';

export type MessageMetadata = {
  provider?: AIProvider;
  documentId?: string;
  imageUrl?: string;
  confidence?: number;
  analysisMode?: AnalysisMode;
  aiService?: {
    type: 'local' | 'cloud' | 'hybrid';
    endpoint: string;
    actualServiceUsed?: 'local' | 'cloud';
  };
  replyTo?: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
  };
};

export interface WebUIConfig {
  model: string;
  provider: AIProvider;
  temperature: number;
  maxTokens: number;
  analysisMode: AnalysisMode;
  useMemory?: boolean;
}

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  context?: string;
  metadata?: MessageMetadata;
  conversationId: string;
  timestamp: Date;
  createdAt?: Date; // This is now an alias for timestamp for compatibility
  replyTo?: string; // Added for compatibility with references
  quotedMessageId?: string;
};

export type ConversationFolder = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  folderId?: string;
  isPinned: boolean;
  isArchived: boolean;
  archiveDate?: Date;
  settings: {
    model: AIProvider;
    maxTokens: number;
    temperature: number;
    streamResponse: boolean;
  };
};
