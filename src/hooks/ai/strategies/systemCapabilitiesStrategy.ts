
import { AIServiceType, TextGenerationParameters } from '../types';
import { checkBrowserCompatibility } from '../analyzers/browserCompatibility';
import { initializeOllama, checkOllamaInstalled } from '../../../utils/ollamaSetup';

/**
 * Crée un gestionnaire de capacités système pour déterminer la stratégie d'exécution optimale
 */
export function createSystemCapabilitiesManager() {
  // Détection initiale du mode hybride
  const hybridModeEnabled = 
    window.location.search.includes('hybrid=true') || 
    localStorage.getItem('hybridMode') === 'true';
  
  // Initialisation d'Ollama au démarrage de l'application si disponible
  if (hybridModeEnabled) {
    // On initialise Ollama en arrière-plan sans bloquer le chargement de l'application
    setTimeout(async () => {
      try {
        await initializeOllama();
      } catch (error) {
        console.error("Erreur lors de l'initialisation d'Ollama:", error);
      }
    }, 2000);
  }
  
  /**
   * Récupère les capacités du système (navigateur, matériel, etc.)
   */
  const getSystemCapabilities = async () => {
    // Vérifier la compatibilité du navigateur
    const browserCompatibility = checkBrowserCompatibility();
    
    // Vérifier si Ollama est disponible
    const ollamaAvailable = await checkOllamaInstalled().catch(() => false);
    
    return {
      hybridModeAvailable: !browserCompatibility.shouldFallbackToCloud,
      sharedBufferAvailable: browserCompatibility.hasSharedArrayBufferSupport,
      navigatorHardwareSupport: browserCompatibility.hasNavigatorHardwareConcurrency,
      ollamaAvailable,
      shouldFallbackToCloud: browserCompatibility.shouldFallbackToCloud
    };
  };
  
  /**
   * Détermine la stratégie d'exécution optimale en fonction des options et du type de service
   */
  const determineExecutionStrategy = async (
    options: TextGenerationParameters,
    serviceType: AIServiceType
  ): Promise<'local' | 'cloud'> => {
    // Si l'utilisateur a spécifié une stratégie, l'utiliser
    if (options.forceCloud) return 'cloud';
    if (options.forceLocal) return 'local';
    
    // Si nous sommes en mode spécifique, utiliser ce mode
    if (serviceType === 'local') return 'local';
    if (serviceType === 'cloud') return 'cloud';
    
    // En mode hybride, déterminer automatiquement la stratégie
    if (serviceType === 'hybrid') {
      // Vérifier si Ollama est disponible
      const ollamaAvailable = await checkOllamaInstalled().catch(() => false);
      
      // Si Ollama est disponible, l'utiliser de préférence
      if (ollamaAvailable) {
        return 'local';
      }
      
      // Par défaut, utiliser le cloud si nous sommes en mode hybride
      // mais que le service local n'est pas disponible
      return 'cloud';
    }
    
    // Par défaut, utiliser le cloud
    return 'cloud';
  };
  
  /**
   * Vérifie si le mode hybride est activé
   */
  const isHybridModeEnabled = () => {
    return hybridModeEnabled;
  };
  
  return {
    getSystemCapabilities,
    determineExecutionStrategy,
    isHybridModeEnabled
  };
}
