
export type ServiceType = 'google_drive' | 'microsoft_teams' | 'openai' | 'deepseek' | 'huggingface' | 'stable_diffusion';

export type LLMProvider = {
  id: ServiceType;
  name: string;
  description: string;
  models: string[];
  docsUrl: string;
};

export type LLMConfig = {
  provider: ServiceType;
  apiKey: string;
  model: string;
  rateLimit: number;
};

export type Credentials = {
  googleClientId?: string;
  googleApiKey?: string;
  microsoftClientId?: string;
  microsoftTenantId?: string;
};

export type GoogleConfig = {
  clientId: string;
  apiKey: string;
};

export type TeamsConfig = {
  clientId: string;
  tenantId: string;
};
