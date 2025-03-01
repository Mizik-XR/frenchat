
/**
 * Utilitaire pour la gestion des capacités système et le routage intelligent
 */
import { estimateSystemCapabilities, analyzeRequest } from '../requestAnalyzer';
import { TextGenerationParameters } from '../types';
import { notifyServiceChange } from '../aiServiceUtils';

// Gestion des capacités système avec mise en cache
export const createSystemCapabilitiesManager = () => {
  let systemCapabilitiesCache: {
    lastCheck: number;
    capabilities: any;
  } | null = null;
  
  // Nombre maximal de tentatives de basculement pour éviter les boucles infinies
  const MAX_FALLBACK_ATTEMPTS = 3;
  let fallbackAttempts = 0;
  
  // Fonction pour obtenir les capacités système avec mise en cache
  const getSystemCapabilities = async () => {
    const now = Date.now();
    
    // Si nous avons des données récentes en cache (moins de 5 minutes), les utiliser
    if (systemCapabilitiesCache && 
        now - systemCapabilitiesCache.lastCheck < 5 * 60 * 1000) {
      return systemCapabilitiesCache.capabilities;
    }
    
    // Sinon, obtenir de nouvelles données
    const capabilities = await estimateSystemCapabilities();
    
    // Mettre à jour le cache
    systemCapabilitiesCache = {
      lastCheck: now,
      capabilities
    };
    
    return capabilities;
  };
  
  // Fonction pour réinitialiser le compteur de tentatives de fallback
  const resetFallbackCounter = () => {
    fallbackAttempts = 0;
  };
  
  // Fonction pour analyser une requête et déterminer le meilleur mode d'exécution
  const determineExecutionStrategy = async (options: TextGenerationParameters, serviceType: string) => {
    // Analyser la requête pour déterminer sa complexité
    const requestProfile = analyzeRequest(options);
    
    // Vérifier les capacités du système si nécessaire
    let forceCloudExecution = false;
    
    if (requestProfile.complexity === 'high' || requestProfile.complexity === 'medium') {
      const systemCapabilities = await getSystemCapabilities();
      
      // Forcer l'exécution cloud si le système n'est pas assez puissant
      if (!systemCapabilities.recommendLocalExecution) {
        forceCloudExecution = true;
        console.log("Capacités système insuffisantes, forçage du mode cloud");
      }
    }
    
    // Vérifier si nous risquons une boucle de fallback
    if (fallbackAttempts >= MAX_FALLBACK_ATTEMPTS) {
      console.warn(`Nombre maximal de tentatives de fallback atteint (${MAX_FALLBACK_ATTEMPTS}), utilisation du cloud par sécurité`);
      notifyServiceChange(
        "Utilisation forcée du service cloud", 
        "Après plusieurs tentatives, le système utilise le service cloud pour assurer la stabilité.",
        "default"
      );
      fallbackAttempts = 0; // Réinitialiser pour les futures requêtes
      return "cloud";
    }
    
    // Si la requête est complexe ou le système pas assez puissant, utiliser le cloud
    // même si l'utilisateur a configuré le mode local
    if ((requestProfile.recommendedExecution === 'cloud' || forceCloudExecution) && serviceType === 'local') {
      fallbackAttempts++; // Incrémenter le compteur de tentatives
      console.log(`Basculement automatique vers le cloud pour une requête complexe (${requestProfile.complexity}, ${requestProfile.estimatedTokens} tokens). Tentative ${fallbackAttempts}/${MAX_FALLBACK_ATTEMPTS}`);
      
      // Informer l'utilisateur du basculement (uniquement pour les requêtes complexes)
      if (requestProfile.complexity === 'high') {
        notifyServiceChange(
          "Utilisation du service cloud",
          "Cette requête complexe est traitée par le service cloud pour de meilleures performances.",
          "default"
        );
      }
      
      return "cloud";
    }
    
    fallbackAttempts = 0; // Réinitialiser si nous utilisons le service normalement
    return serviceType;
  };
  
  return { getSystemCapabilities, determineExecutionStrategy, resetFallbackCounter };
};
