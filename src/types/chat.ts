
export type AIProvider = 'auto' | 'huggingface' | 'internet-search' | 'deepseek' | 'stable-diffusion' | 'mistral' | 'ollama';

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

export type WebUIConfig = {
  mode: 'auto' | 'manual';
  model: AIProvider;
  maxTokens: number;
  temperature: number;
  streamResponse: boolean;
  analysisMode: AnalysisMode;
  useMemory: boolean;
  // Ajout des propriétés manquantes
  autoMode: boolean;
  modelSource: 'local' | 'cloud';
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  context?: string;
  metadata?: MessageMetadata;
  conversationId: string;
  timestamp: Date;
  // Renommage de createdAt pour correspondre à timestamp lors des références
  createdAt?: Date;
  // Ajout de la propriété replyTo
  replyTo?: string;
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
