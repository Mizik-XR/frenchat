
export type ServiceType = 'huggingface' | 'openai' | 'deepseek';

export type LLMProvider = {
  id: ServiceType;
  name: string;
  description: string;
  models: string[];
  docsUrl: string;
  requiresApiKey: boolean;
};

export type LLMConfig = {
  provider: ServiceType;
  apiKey: string;
  model: string;
  rateLimit: number;
};
