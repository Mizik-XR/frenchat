
/**
 * Limites de tokens par défaut pour différents fournisseurs
 */
export const DEFAULT_TOKEN_LIMITS: Record<string, number> = {
  'openai': 2000,
  'anthropic': 4000,
  'deepseek': 2000,
  'huggingface': 1000,
  'mistral': 3000,
  'default': 1500
};
