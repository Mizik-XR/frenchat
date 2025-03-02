
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { LLMProviderType } from '@/types/config';
import { 
  TextGenerationParameters, 
  TextGenerationResponse,
  AIServiceType
} from './ai/types';

import { 
  checkLocalService,
  setLocalProviderConfig as setProviderConfig,
  detectLocalServices as detectServices,
  notifyServiceChange
} from './ai/aiServiceUtils';

import { executeAIRequest } from './ai/strategies/aiServiceStrategy';
import { createSystemCapabilitiesManager } from './ai/strategies/systemCapabilitiesStrategy';
import { useModelDownload } from './useModelDownload';
import { checkBrowserCompatibility } from './ai/analyzers/browserCompatibility';

export function useHuggingFace(provider: string = 'huggingface') {
  // Vérifier si le mode hybride est activé
  const { 
    getSystemCapabilities, 
    determineExecutionStrategy,
    isHybridModeEnabled
  } = createSystemCapabilitiesManager();
  
  const hybridModeEnabled = isHybridModeEnabled();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<AIServiceType>(
    hybridModeEnabled 
      ? 'hybrid' 
      : (localStorage.getItem('aiServiceType') as AIServiceType || 'cloud')
  );
  const [localAIUrl, setLocalAIUrl] = useState<string | null>(
    localStorage.getItem('localAIUrl') || 'http://localhost:8000'
  );
  const [localProvider, setLocalProvider] = useState<LLMProviderType>(
    localStorage.getItem('localProvider') as LLMProviderType || 'huggingface'
  );

  const { 
    downloadStatus: modelDownloadStatus, 
    startModelDownload: downloadModel,
    fetchDownloadProgress
  } = useModelDownload();

  useEffect(() => {
    // Mettre à jour le type de service si le mode hybride est détecté
    if (hybridModeEnabled && serviceType !== 'hybrid') {
      setServiceType('hybrid');
      console.log("Mode hybride activé via URL ou configuration");
      localStorage.setItem('hybridMode', 'true');
      
      toast({
        title: "Mode hybride activé",
        description: "FileChat utilise maintenant les modèles locaux et cloud ensemble",
        variant: "default"
      });
    }
    
    const handleStorageChange = () => {
      // Ne pas écraser le mode hybride s'il est activé
      if (!hybridModeEnabled) {
        setServiceType(localStorage.getItem('aiServiceType') as AIServiceType || 'cloud');
      }
      setLocalAIUrl(localStorage.getItem('localAIUrl') || 'http://localhost:8000');
      setLocalProvider(localStorage.getItem('localProvider') as LLMProviderType || 'huggingface');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [hybridModeEnabled]);

  useEffect(() => {
    const checkCompatibility = () => {
      const browserCompatibility = checkBrowserCompatibility();
      
      // Si le navigateur n'est pas compatible avec des fonctionnalités critiques,
      // basculer automatiquement vers le mode cloud
      if (browserCompatibility.shouldFallbackToCloud && !hybridModeEnabled) {
        setServiceType('cloud');
        localStorage.setItem('aiServiceType', 'cloud');
        
        // Notification uniquement en mode développement ou debug
        if (import.meta.env.DEV || window.location.search.includes('debug=true')) {
          toast({
            title: "Compatibilité navigateur",
            description: `Mode cloud automatiquement activé - votre navigateur ne supporte pas l'IA locale`,
            variant: "default"
          });
        }
      }
    };
    
    checkCompatibility();
  }, [hybridModeEnabled]);

  // Vérifier périodiquement la disponibilité du service local en mode hybride
  useEffect(() => {
    if (serviceType === 'hybrid') {
      const checkLocalAvailability = async () => {
        const result = await checkLocalService(localAIUrl || 'http://localhost:8000');
        if (result.available) {
          console.log("Service local disponible en mode hybride");
        } else {
          console.log("Service local non disponible en mode hybride:", result.error);
        }
      };
      
      // Vérifier immédiatement, puis toutes les 30 secondes
      checkLocalAvailability();
      const interval = setInterval(checkLocalAvailability, 30000);
      
      return () => clearInterval(interval);
    }
  }, [serviceType, localAIUrl]);

  const textGeneration = async (options: TextGenerationParameters): Promise<TextGenerationResponse[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const executionStrategy = await determineExecutionStrategy(options, serviceType);
      
      const response = await executeAIRequest(
        options, 
        executionStrategy, 
        localAIUrl, 
        localProvider, 
        modelDownloadStatus, 
        provider
      );
      
      if (serviceType === 'local' && executionStrategy === 'cloud') {
        console.log("Basculement temporaire vers le cloud");
      } else if (serviceType === 'hybrid') {
        console.log(`Mode hybride: utilisation de la stratégie ${executionStrategy}`);
      }
      
      return response;
    } catch (e) {
      console.error("Erreur lors de l'appel au modèle:", e);
      setError(e instanceof Error ? e.message : String(e));
      
      if (serviceType === 'hybrid') {
        // En mode hybride, on tente de basculer d'une stratégie à l'autre en cas d'erreur
        try {
          console.log("Tentative de basculement automatique en mode hybride");
          const fallbackStrategy = options.forceLocal ? 'cloud' : 'local';
          
          // Forcer la stratégie opposée
          const fallbackOptions = { 
            ...options,
            forceLocal: fallbackStrategy === 'local', 
            forceCloud: fallbackStrategy === 'cloud'
          };
          
          toast({
            title: "Basculement automatique",
            description: `Tentative d'utilisation du service ${fallbackStrategy === 'local' ? 'local' : 'cloud'}`,
            variant: "default"
          });
          
          const fallbackResponse = await executeAIRequest(
            fallbackOptions, 
            fallbackStrategy, 
            localAIUrl, 
            localProvider, 
            modelDownloadStatus, 
            provider
          );
          
          return fallbackResponse;
        } catch (fallbackError) {
          console.error("Échec du basculement automatique:", fallbackError);
          // Si le basculement échoue également, on rejette avec l'erreur d'origine
          throw e;
        }
      } else {
        // En mode non-hybride, on affiche simplement l'erreur
        notifyServiceChange(
          "Erreur de connexion au service d'IA",
          "Impossible de se connecter au service d'IA. Vérifiez votre connexion ou essayez plus tard.",
          "destructive"
        );
        
        throw e;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setLocalProviderConfig = useCallback((provider: LLMProviderType) => {
    const updatedProvider = setProviderConfig(provider);
    setLocalProvider(updatedProvider);
    return updatedProvider;
  }, []);

  // Activer explicitement le mode hybride
  const enableHybridMode = useCallback(() => {
    setServiceType('hybrid');
    localStorage.setItem('hybridMode', 'true');
    
    toast({
      title: "Mode hybride activé",
      description: "FileChat utilise maintenant les modèles locaux et cloud ensemble",
      variant: "default"
    });
  }, []);

  // Désactiver le mode hybride
  const disableHybridMode = useCallback(() => {
    const defaultMode: AIServiceType = 'cloud';
    setServiceType(defaultMode);
    localStorage.removeItem('hybridMode');
    localStorage.setItem('aiServiceType', defaultMode);
    
    toast({
      title: "Mode hybride désactivé",
      description: `FileChat utilise maintenant uniquement le mode ${defaultMode}`,
      variant: "default"
    });
  }, []);

  return { 
    textGeneration, 
    isLoading, 
    error,
    serviceType,
    localAIUrl,
    localProvider,
    checkLocalService,
    setLocalProviderConfig,
    detectLocalServices: detectServices,
    modelDownloadStatus,
    downloadModel,
    modelsAvailable: [],
    isHybridMode: serviceType === 'hybrid',
    enableHybridMode,
    disableHybridMode
  };
}
