
export type ServiceType = 'huggingface' | 'openai' | 'deepseek' | 'google_drive' | 'microsoft_teams';

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

export type GoogleConfig = {
  clientId: string;
  apiKey: string;
};

export type TeamsConfig = {
  clientId: string;
  tenantId: string;
};

// Anciennement Credentials, maintenant retiré car non utilisé
export type ServiceCredentials = {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
};
