
import { DEFAULT_TOKEN_LIMITS } from './constants';
import { estimateTokenCount, truncateToMaxTokens } from '@/utils/chunking/smartChunking';

/**
 * Manages token limits and optimizes prompts
 */
export function optimizeTokenUsage(
  prompt: string,
  systemPrompt: string,
  provider: string,
  options: any
): { 
  optimizedOptions: any, 
  estimatedInputTokens: number 
} {
  // Estimer les tokens d'entrée
  const estimatedInputTokens = estimateTokenCount(prompt) + estimateTokenCount(systemPrompt);
  const maxTokens = options.max_length || options.parameters?.max_length || 
    DEFAULT_TOKEN_LIMITS[provider] || DEFAULT_TOKEN_LIMITS.default;
  
  // Cloner les options pour ne pas modifier l'original
  const optimizedOptions = { ...options };
  
  // Vérifier si la longueur du prompt dépasse les limites
  if (estimatedInputTokens > maxTokens * 2) {
    const truncatedPrompt = truncateToMaxTokens(prompt, maxTokens);
    console.warn(`Prompt tronqué de ${prompt.length} à ${truncatedPrompt.length} caractères`);
    
    if (optimizedOptions.prompt) optimizedOptions.prompt = truncatedPrompt;
    if (optimizedOptions.inputs) optimizedOptions.inputs = truncatedPrompt;
  }
  
  // Limiter explicitement les tokens de sortie
  if (optimizedOptions.parameters) {
    optimizedOptions.parameters.max_length = maxTokens;
  } else if (optimizedOptions.max_length) {
    optimizedOptions.max_length = maxTokens;
  } else {
    optimizedOptions.parameters = { max_length: maxTokens };
  }
  
  return { optimizedOptions, estimatedInputTokens };
}
