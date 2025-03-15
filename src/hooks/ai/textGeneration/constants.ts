
/**
 * Limites de tokens par défaut pour différents fournisseurs
 */
export const DEFAULT_TOKEN_LIMITS: Record<string, number> = {
  'openai': 2000,
  'anthropic': 4000,
  'deepseek': 2000,
  'huggingface': 1000,
  'mistral': 3000,
  'gemma': 2048,
  'google': 2048,
  'perplexity': 4000,
  'default': 1500
};

/**
 * Configuration des modèles par API
 */
export const MODEL_CONFIGURATIONS = {
  'openai': {
    defaultModel: 'gpt-4o-mini',
    alternativeModels: ['gpt-4o', 'gpt-3.5-turbo'],
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
  },
  'google': {
    defaultModel: 'gemini-pro',
    alternativeModels: ['gemini-pro-vision'],
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  'deepseek': {
    defaultModel: 'deepseek-coder-v2-instruct',
    alternativeModels: ['deepseek-chat', 'deepseek-coder-33b-instruct'],
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions'
  }
};

/**
 * Paramètres par défaut pour les requêtes
 */
export const DEFAULT_REQUEST_PARAMS = {
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 0.95,
  frequency_penalty: 0,
  presence_penalty: 0
};
