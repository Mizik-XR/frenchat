
import { WebUIConfig } from "@/types/chat";

// Type pour les options d'envoi de message
export interface SendMessageOptions {
  content: string;
  conversationId: string;
  files?: File[];
  fileUrls?: string[];
  replyTo?: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
  };
  config: WebUIConfig;
}

// Type pour les résultats de la génération de message
export interface MessageResult {
  userMessage: {
    id: string;
    role: string;
    content: string;
    conversationId: string;
    metadata: any;
    timestamp: Date;
  };
  assistantMessage: {
    id: string;
    role: string;
    content: string;
    conversationId: string;
    metadata: any;
    timestamp: Date;
  };
}
