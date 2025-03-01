
import { TextGenerationParameters } from '../types';

interface RequestProfile {
  complexity: 'low' | 'medium' | 'high';
  estimatedTokens: number;
  recommendedExecution: 'local' | 'cloud';
}

/**
 * Analyse une requête pour déterminer sa complexité et le meilleur mode d'exécution
 */
export const analyzeRequest = (options: TextGenerationParameters): RequestProfile => {
  // Récupérer le texte à analyser (prompt ou inputs)
  const text = options.inputs || options.prompt || '';
  
  // 1. Estimation améliorée de la longueur en tokens
  // Utilisation d'un ratio plus précis pour l'estimation (4 caractères = ~1 token en moyenne)
  const estimatedTokens = Math.ceil(text.length / 4);
  
  // 2. Analyse de complexité basée sur plusieurs facteurs
  let complexity: 'low' | 'medium' | 'high' = 'low';
  
  // Analyse basée sur la longueur
  if (estimatedTokens > 8000) {
    complexity = 'high';
  } else if (estimatedTokens > 2000) {
    complexity = 'medium';
  }
  
  // Analyse basée sur des marqueurs de complexité dans le texte
  const complexityMarkers = [
    // Marqueurs d'analyse approfondie
    "analyse", "résumé", "synthèse", "expliquer en détail",
    "comparer", "différence entre", "expliquer pourquoi",
    // Requêtes complexes
    "rédiger", "écrire un", "générer un", "créer un document",
    // Traitement multilingue
    "traduire", "translation", "translate",
    // Requêtes de code
    "code", "function", "algorithm", "programming"
  ];
  
  // Si le texte contient des marqueurs de complexité, augmenter le niveau
  if (complexity !== 'high' && 
      complexityMarkers.some(marker => text.toLowerCase().includes(marker))) {
    complexity = complexity === 'low' ? 'medium' : 'high';
  }
  
  // 3. Déterminer le mode d'exécution recommandé avec seuils ajustés
  let recommendedExecution: 'local' | 'cloud' = 'local';
  
  // Règles de routage affinées
  if (complexity === 'high') {
    // Requêtes complexes → cloud
    recommendedExecution = 'cloud';
  } else if (complexity === 'medium' && estimatedTokens > 2000) {
    // Requêtes moyennes volumineuses → cloud
    recommendedExecution = 'cloud';
  } else if (estimatedTokens > 6000) {
    // Requêtes très longues même si pas complexes → cloud
    recommendedExecution = 'cloud';
  }
  
  // Log pour débogage
  console.debug(`Analyse de requête: ${estimatedTokens} tokens, complexité ${complexity}, exécution recommandée: ${recommendedExecution}`);
  
  return {
    complexity,
    estimatedTokens,
    recommendedExecution
  };
};
