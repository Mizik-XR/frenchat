
import { TextGenerationParameters } from '../types';

/**
 * Analyse une requête pour déterminer sa complexité
 */
export function analyzeRequest(params: TextGenerationParameters): {
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTokens: number;
  recommendedMode: 'local' | 'cloud';
} {
  // Obtenir le texte à traiter
  const prompt = params.prompt || params.inputs || '';
  const systemPrompt = params.system_prompt || '';
  
  // Estimation grossière du nombre de tokens (environ 4 caractères par token)
  const totalText = prompt + systemPrompt;
  const estimatedTokens = Math.ceil(totalText.length / 4);
  
  // Évaluation de la complexité basée sur la longueur
  let complexity: 'simple' | 'moderate' | 'complex';
  if (estimatedTokens < 200) complexity = 'simple';
  else if (estimatedTokens < 1000) complexity = 'moderate';
  else complexity = 'complex';
  
  // Recommandation basée sur la complexité et les paramètres
  const temperature = params.temperature || params.parameters?.temperature || 0.7;
  const isCreative = temperature > 0.8;
  
  let recommendedMode: 'local' | 'cloud';
  
  if (complexity === 'complex' || isCreative || estimatedTokens > 1500) {
    recommendedMode = 'cloud';
  } else {
    recommendedMode = 'local';
  }
  
  return {
    complexity,
    estimatedTokens,
    recommendedMode
  };
}
