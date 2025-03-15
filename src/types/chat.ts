
export type AIProvider = 'openai' | 'anthropic' | 'google-palm' | 'huggingface' | 'mistral' | 'local' | 'ollama' | 'openai-agent' | 'perplexity';

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
  allowAnonymous?: boolean; // Adding the missing property
}
