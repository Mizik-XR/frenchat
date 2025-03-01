
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

/**
 * Analyse les capacités du système local (mémoire, CPU)
 * Cette fonction fournit une estimation précise côté JS
 * L'analyse complète est également effectuée côté Python
 */
export const estimateSystemCapabilities = async (): Promise<{
  memoryScore: number;
  cpuScore: number;
  gpuAvailable: boolean;
  recommendLocalExecution: boolean;
}> => {
  try {
    // Valeurs par défaut optimistes mais prudentes
    let memoryScore = 0.6;
    let cpuScore = 0.6;
    let gpuAvailable = false;
    
    // Essayer d'obtenir des informations sur la mémoire via l'API Navigator
    // Note: deviceMemory n'est pas disponible dans tous les navigateurs
    // Utilisons une assertion de type pour accéder à cette propriété non-standard
    const memory = (navigator as any).deviceMemory;
    if (memory !== undefined) {
      // deviceMemory donne la RAM en GB (valeurs possibles: 0.25, 0.5, 1, 2, 4, 8)
      memoryScore = Math.min(memory / 8, 1);
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
      
      // Si WebGL est disponible, vérifier quelques capacités supplémentaires
      if (gl) {
        // Cast gl à WebGLRenderingContext pour accéder aux méthodes WebGL
        const webGLContext = gl as WebGLRenderingContext;
        
        // WEBGL_debug_renderer_info est une extension WebGL
        const debugInfo = webGLContext.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = webGLContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          // Log pour débogage
          console.debug(`GPU détecté: ${renderer}`);
          // Détecter si c'est une carte graphique dédiée
          const isDedicatedGPU = renderer && (
            renderer.includes('NVIDIA') || 
            renderer.includes('AMD') || 
            renderer.includes('Radeon')
          );
          if (isDedicatedGPU) {
            // Bonus pour GPU dédié
            memoryScore += 0.1;
            cpuScore += 0.1;
          }
        }
      }
    } catch (e) {
      gpuAvailable = false;
      console.debug("Erreur lors de la détection GPU:", e);
    }
    
    // Mesurer la latence réseau (indicateur de connexion)
    let networkScore = 0.7; // Valeur par défaut (bonne connexion)
    try {
      const startTime = performance.now();
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      // Ajuster le score réseau en fonction de la latence
      if (latency < 50) networkScore = 1.0;      // Excellente connexion
      else if (latency < 100) networkScore = 0.9; // Très bonne connexion
      else if (latency < 200) networkScore = 0.7; // Bonne connexion
      else if (latency < 500) networkScore = 0.5; // Connexion moyenne
      else networkScore = 0.3;                   // Connexion lente
      
      console.debug(`Latence réseau: ${latency.toFixed(2)}ms, score: ${networkScore}`);
    } catch (e) {
      console.debug("Erreur lors du test de latence réseau:", e);
    }
    
    // Décision finale basée sur tous les scores
    // Privilégier l'exécution locale si les ressources sont bonnes
    // et la connexion n'est pas excellente (meilleure expérience)
    const systemScore = (memoryScore * 0.4) + (cpuScore * 0.4) + (networkScore * 0.2);
    const recommendLocalExecution = 
      (systemScore > 0.6 && networkScore < 0.95) || // Bonnes ressources locales et connexion non parfaite
      (gpuAvailable && systemScore > 0.5) ||        // GPU disponible avec ressources correctes
      (memoryScore > 0.7 && cpuScore > 0.6);        // Très bonne mémoire et CPU corrects
    
    console.debug(`Scores système - Mémoire: ${memoryScore.toFixed(2)}, CPU: ${cpuScore.toFixed(2)}, Réseau: ${networkScore.toFixed(2)}, Global: ${systemScore.toFixed(2)}`);
    console.debug(`Recommandation d'exécution locale: ${recommendLocalExecution}`);
    
    return {
      memoryScore,
      cpuScore,
      gpuAvailable,
      recommendLocalExecution
    };
  } catch (error) {
    console.error("Erreur lors de l'estimation des capacités système:", error);
    // En cas d'erreur, recommander l'exécution cloud par sécurité
    return {
      memoryScore: 0.5,
      cpuScore: 0.5,
      gpuAvailable: false,
      recommendLocalExecution: false
    };
  }
};

// Fonction pour vérifier si le navigateur est compatible avec l'exécution locale
export const checkBrowserCompatibility = (): {
  compatible: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Vérifier la compatibilité des API Web modernes
  if (!window.fetch) issues.push("Fetch API non supportée");
  if (!window.WebSocket) issues.push("WebSockets non supportés");
  if (!window.indexedDB) issues.push("IndexedDB non supporté");
  
  // Vérifier la compatibilité des fonctionnalités ES6+ essentielles
  try {
    // Test des fonctions arrow, async/await, et destructuring
    eval("const test = async () => { const {a, b} = {a: 1, b: 2}; await Promise.resolve(); }");
  } catch (e) {
    issues.push("JavaScript moderne (ES6+) non supporté");
  }
  
  return {
    compatible: issues.length === 0,
    issues
  };
};
