
import { 
  estimateSystemCapabilities,
  checkBrowserCompatibility,
  testResponseTime,
  detectBrowser,
  getNetworkType,
  testCloudService,
  determineRecommendedMode
} from '../requestAnalyzer';

import { TextGenerationParameters, AIServiceType } from '../types';

/**
 * Gestionnaire des capacités système pour déterminer la meilleure stratégie d'exécution
 */
export function createSystemCapabilitiesManager() {
  // Cache des capacités système pour éviter les recalculs fréquents
  let systemCapabilitiesCache: Awaited<ReturnType<typeof estimateSystemCapabilities>> | null = null;
  let systemCapabilitiesCacheTime = 0;
  const CACHE_LIFETIME_MS = 5 * 60 * 1000; // 5 minutes
  
  // Cache de la recommandation pour éviter de retester trop souvent
  let recommendedModeCache: Awaited<ReturnType<typeof determineRecommendedMode>> | null = null;
  let recommendedModeCacheTime = 0;
  const RECOMMENDATION_CACHE_LIFETIME_MS = 30 * 1000; // 30 secondes
  
  // Obtenir les capacités système avec cache
  const getSystemCapabilities = async () => {
    const now = Date.now();
    if (
      !systemCapabilitiesCache || 
      now - systemCapabilitiesCacheTime > CACHE_LIFETIME_MS
    ) {
      systemCapabilitiesCache = await estimateSystemCapabilities();
      systemCapabilitiesCacheTime = now;
    }
    return systemCapabilitiesCache;
  };
  
  // Déterminer si le mode hybride est activé via les URL params
  const isHybridModeEnabled = () => {
    // Vérifier si le paramètre hybrid=true est présent dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const hybridParam = urlParams.get('hybrid');
    
    // Vérifier également la variable d'environnement ou localStorage
    const envHybrid = import.meta.env.VITE_HYBRID_MODE === 'true';
    const localStorageHybrid = localStorage.getItem('hybridMode') === 'true';
    
    return hybridParam === 'true' || envHybrid || localStorageHybrid;
  };
  
  // Déterminer la stratégie d'exécution
  const determineExecutionStrategy = async (
    options: TextGenerationParameters,
    serviceType: AIServiceType
  ): Promise<'local' | 'cloud'> => {
    // Si options.forceLocal est true, on exécute en local peu importe
    if (options.forceLocal === true) {
      console.log("Exécution locale forcée par les options");
      return 'local';
    }
    
    // Si options.forceCloud est true, on exécute en cloud peu importe
    if (options.forceCloud === true) {
      console.log("Exécution cloud forcée par les options");
      return 'cloud';
    }
    
    // Vérifier si le mode hybride est activé
    const hybridMode = isHybridModeEnabled();
    if (hybridMode && serviceType === 'hybrid') {
      console.log("Mode hybride détecté, tentative d'utilisation du local d'abord");
      
      // En mode hybride, on va d'abord vérifier si le service local est disponible
      const localAvailable = await fetch('http://localhost:8000/status')
        .then(response => response.ok)
        .catch(() => false);
      
      if (localAvailable) {
        console.log("Service local disponible en mode hybride");
        return 'local';
      } else {
        console.log("Service local non disponible en mode hybride, repli sur le cloud");
        return 'cloud';
      }
    }
    
    // Si le serviceType est spécifié et explicite, on le respecte
    if (serviceType === 'local') {
      return 'local';
    } else if (serviceType === 'cloud') {
      return 'cloud';
    }
    
    // Si aucune préférence n'est spécifiée, on utilise les recommandations
    const now = Date.now();
    if (
      !recommendedModeCache || 
      now - recommendedModeCacheTime > RECOMMENDATION_CACHE_LIFETIME_MS
    ) {
      recommendedModeCache = await determineRecommendedMode();
      recommendedModeCacheTime = now;
    }
    
    return recommendedModeCache.recommendedMode === 'local' ? 'local' : 'cloud';
  };
  
  return {
    getSystemCapabilities,
    determineExecutionStrategy,
    isHybridModeEnabled
  };
}
