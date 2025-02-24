
export type AIProvider = 'auto' | 'huggingface' | 'internet-search' | 'deepthink' | 'stable-diffusion';

export type MessageType = 'text' | 'document' | 'image';

export type MessageMetadata = {
  provider?: AIProvider;
  documentId?: string;
  imageUrl?: string;
  confidence?: number;
};

export type WebUIConfig = {
  mode: 'auto' | 'manual';
  model: AIProvider;
  maxTokens: number;
  temperature: number;
  streamResponse: boolean;
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
};
