
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
import { checkBrowserCompatibility } from './ai/requestAnalyzer';

export function useHuggingFace(provider: string = 'huggingface') {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<AIServiceType>(
    localStorage.getItem('aiServiceType') as AIServiceType || 'cloud'
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
    const handleStorageChange = () => {
      setServiceType(localStorage.getItem('aiServiceType') as AIServiceType || 'cloud');
      setLocalAIUrl(localStorage.getItem('localAIUrl') || 'http://localhost:8000');
      setLocalProvider(localStorage.getItem('localProvider') as LLMProviderType || 'huggingface');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const checkCompatibility = () => {
      const browserCompatibility = checkBrowserCompatibility();
      if (!browserCompatibility.compatible) {
        setServiceType('cloud');
        localStorage.setItem('aiServiceType', 'cloud');
        
        toast({
          title: "Fonctionnalités limitées",
          description: `Votre navigateur ne supporte pas toutes les fonctionnalités requises pour l'exécution locale: ${browserCompatibility.issues.join(", ")}`,
          variant: "destructive"
        });
      }
    };
    
    checkCompatibility();
  }, []);

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
      }
      
      return response;
    } catch (e) {
      console.error("Erreur lors de l'appel au modèle:", e);
      setError(e instanceof Error ? e.message : String(e));
      
      notifyServiceChange(
        "Erreur de connexion au service d'IA",
        "Impossible de se connecter au service d'IA. Vérifiez votre connexion ou essayez plus tard.",
        "destructive"
      );
      
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
    serviceType,
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
