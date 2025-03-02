
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
  // Vérifier immédiatement si le mode cloud est forcé
  const isCloudModeForced = window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true' ||
                           new URLSearchParams(window.location.search).get('forceCloud') === 'true';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<AIServiceType>(
    isCloudModeForced ? 'cloud' : 
    (localStorage.getItem('aiServiceType') as AIServiceType || 'cloud')
  );
  const [localAIUrl, setLocalAIUrl] = useState<string | null>(
    localStorage.getItem('localAIUrl') || 'http://localhost:8000'
  );
  const [localProvider, setLocalProvider] = useState<LLMProviderType>(
    localStorage.getItem('localProvider') as LLMProviderType || 'huggingface'
  );

  const { 
    getSystemCapabilities, 
    determineExecutionStrategy 
  } = createSystemCapabilitiesManager();
  
  const { 
    downloadStatus: modelDownloadStatus, 
    startModelDownload: downloadModel,
    fetchDownloadProgress
  } = useModelDownload();

  useEffect(() => {
    // Si le mode cloud est forcé, définir les préférences en conséquence
    if (isCloudModeForced && serviceType !== 'cloud') {
      console.log("Mode cloud forcé, mise à jour des préférences");
      setServiceType('cloud');
      localStorage.setItem('aiServiceType', 'cloud');
    }

    const handleStorageChange = () => {
      // Ne pas permettre le changement de serviceType si le mode cloud est forcé
      if (!isCloudModeForced) {
        const storedServiceType = localStorage.getItem('aiServiceType') as AIServiceType;
        setServiceType(storedServiceType || 'cloud');
      }
      
      setLocalAIUrl(localStorage.getItem('localAIUrl') || 'http://localhost:8000');
      setLocalProvider(localStorage.getItem('localProvider') as LLMProviderType || 'huggingface');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isCloudModeForced, serviceType]);

  useEffect(() => {
    const checkCompatibility = () => {
      // Si le mode cloud est forcé, ignorer la vérification de compatibilité
      if (isCloudModeForced) {
        return;
      }
      
      const browserCompatibility = checkBrowserCompatibility();
      
      // Si le navigateur n'est pas compatible avec des fonctionnalités critiques,
      // basculer automatiquement vers le mode cloud
      if (browserCompatibility.shouldFallbackToCloud) {
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
  }, [isCloudModeForced]);

  const textGeneration = async (options: TextGenerationParameters): Promise<TextGenerationResponse[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Si mode cloud forcé, toujours utiliser la stratégie cloud
      const executionStrategy = isCloudModeForced ? 'cloud' : 
        await determineExecutionStrategy(options, serviceType);
      
      console.log(`Exécution avec la stratégie: ${executionStrategy} (forceCloud: ${isCloudModeForced})`);
      
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
      }
      
      return response;
    } catch (e) {
      console.error("Erreur lors de l'appel au modèle:", e);
      setError(e instanceof Error ? e.message : String(e));
      
      // Ne pas afficher de notification en cas de mode cloud forcé et erreur locale
      if (!isCloudModeForced || (isCloudModeForced && serviceType === 'cloud')) {
        notifyServiceChange(
          "Erreur de connexion au service d'IA",
          "Impossible de se connecter au service d'IA. Vérifiez votre connexion ou essayez plus tard.",
          "destructive"
        );
      }
      
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const setLocalProviderConfig = useCallback((provider: LLMProviderType) => {
    const updatedProvider = setProviderConfig(provider);
    setLocalProvider(updatedProvider);
    return updatedProvider;
  }, []);

  return { 
    textGeneration, 
    isLoading, 
    error,
    serviceType: isCloudModeForced ? 'cloud' : serviceType,  // Toujours renvoyer 'cloud' si mode forcé
    localAIUrl,
    localProvider,
    checkLocalService,
    setLocalProviderConfig,
    detectLocalServices: detectServices,
    modelDownloadStatus,
    downloadModel,
    modelsAvailable: []
  };
}
