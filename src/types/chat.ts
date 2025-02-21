
import { ServiceType } from "./config";

export type AIProvider = 'auto' | ServiceType | 'stable-diffusion';

export type MessageType = 'text' | 'document' | 'image';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  context?: string;
  metadata?: {
    provider?: AIProvider;
    documentId?: string;
    imageUrl?: string;
    confidence?: number;
  };
  timestamp: Date;
};

export type WebUIConfig = {
  mode: 'auto' | 'manual';
  model: AIProvider;
  maxTokens: number;
  temperature: number;
  streamResponse: boolean;
};
