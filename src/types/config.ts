
export type ServiceType = 'huggingface' | 'openai' | 'deepseek' | 'google_drive' | 'microsoft_teams' | 'ollama' | 'phi' | 'local' | 'stable_diffusion' | 'llm';

export type LLMProvider = {
  id: ServiceType;
  name: string;
  description: string;
  models: string[];
  docsUrl: string;
  requiresApiKey: boolean;
  isLocal?: boolean;
  setupInstructions?: string;
};

export type LLMConfig = {
  provider: ServiceType;
  apiKey: string;
  model: string;
  rateLimit: number;
  useLocal?: boolean;
  batchSize?: number;
  cacheEnabled?: boolean;
};

export type GoogleConfig = {
  clientId: string;
  apiKey: string;
};

export type TeamsConfig = {
  clientId: string;
  tenantId: string;
};

export type ServiceCredentials = {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
};
