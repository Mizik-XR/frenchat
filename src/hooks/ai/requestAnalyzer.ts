
import { TextGenerationParameters } from './types';

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
  
  // 1. Estimation simple de la longueur en tokens (approximatif)
  // En moyenne, 1 token = 4 caractères en anglais/français
  const estimatedTokens = Math.ceil(text.length / 4);
  
  // 2. Analyse de complexité basée sur la longueur et d'autres facteurs
  let complexity: 'low' | 'medium' | 'high' = 'low';
  
  if (estimatedTokens > 8000) {
    complexity = 'high';
  } else if (estimatedTokens > 2000) {
    complexity = 'medium';
  }
  
  // Détecter les marqueurs de complexité dans le texte
  const complexityMarkers = [
    "analyse", "résumé", "synthèse", "expliquer en détail",
    "comparer", "différence entre", "expliquer pourquoi"
  ];
  
  // Si le texte contient des marqueurs de complexité, augmenter le niveau
  if (complexity !== 'high' && 
      complexityMarkers.some(marker => text.toLowerCase().includes(marker))) {
    complexity = complexity === 'low' ? 'medium' : 'high';
  }
  
  // 3. Déterminer le mode d'exécution recommandé
  let recommendedExecution: 'local' | 'cloud' = 'local';
  
  // Règles de routage simples
  if (complexity === 'high' || estimatedTokens > 4000) {
    // Requêtes complexes ou longues -> cloud
    recommendedExecution = 'cloud';
  } else if (complexity === 'medium' && estimatedTokens > 1000) {
    // Requêtes moyennes -> dépend de la configuration/puissance locale
    // Par défaut on reste en local pour les requêtes moyennes, 
    // mais ce sera affiné avec l'analyse des ressources système côté Python
    recommendedExecution = 'local';
  }
  
  return {
    complexity,
    estimatedTokens,
    recommendedExecution
  };
};

/**
 * Analyse les capacités du système local (mémoire, CPU)
 * Cette fonction ne fait qu'une estimation côté JS
 * L'analyse complète est faite côté Python
 */
export const estimateSystemCapabilities = async (): Promise<{
  memoryScore: number;
  cpuScore: number;
  gpuAvailable: boolean;
  recommendLocalExecution: boolean;
}> => {
  try {
    // Par défaut, supposons que l'exécution locale est possible
    let memoryScore = 0.7;
    let cpuScore = 0.7;
    let gpuAvailable = false;
    
    // Essayer d'obtenir des informations sur la mémoire via l'API Navigator
    if (navigator && navigator.deviceMemory) {
      // deviceMemory donne la RAM en GB (valeurs possibles: 0.25, 0.5, 1, 2, 4, 8)
      memoryScore = Math.min(navigator.deviceMemory / 8, 1);
    }
    
    // Essayer d'obtenir le nombre de cœurs logiques
    if (navigator && navigator.hardwareConcurrency) {
      // hardwareConcurrency donne le nombre de cœurs logiques
      cpuScore = Math.min(navigator.hardwareConcurrency / 8, 1);
    }
    
    // Vérifier si WebGL est disponible (indication grossière de GPU)
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      gpuAvailable = !!gl;
    } catch (e) {
      gpuAvailable = false;
    }
    
    // Décision finale basée sur les scores
    const recommendLocalExecution = 
      memoryScore > 0.4 && cpuScore > 0.4 || gpuAvailable;
    
    return {
      memoryScore,
      cpuScore,
      gpuAvailable,
      recommendLocalExecution
    };
  } catch (error) {
    console.error("Erreur lors de l'estimation des capacités système:", error);
    // En cas d'erreur, recommander l'exécution locale par défaut
    return {
      memoryScore: 0.7,
      cpuScore: 0.7,
      gpuAvailable: false,
      recommendLocalExecution: true
    };
  }
};
