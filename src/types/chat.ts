
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
}

export type AIProvider = 'openai' | 'huggingface' | 'llama-2-70b-chat';

export interface WebUIConfig {
  model: AIProvider;
  maxTokens: number;
  temperature: number;
  streamResponse: boolean;
}
