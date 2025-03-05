
import { useState, useEffect, useCallback } from 'react';
import { LLMProviderType } from '@/types/config';
import { 
  TextGenerationParameters, 
  TextGenerationResponse,
  AIServiceType
} from './ai/types';

import { 
  checkLocalService,
  setLocalProviderConfig as configureLocalProvider,
  detectLocalServices,
  notifyServiceChange
} from './ai/aiServiceUtils';

import { useModelDownload } from './useModelDownload';
import { generateText } from './ai/textGeneration/generateText';
import { isCloudModeForced, setupServiceModeListener } from './ai/environment/environmentDetection';
import { 
  checkBrowserCompatibilityAndSetMode,
  ensureDefaultServiceModeSet
} from './ai/serviceManagement/compatibilityCheck';
import { useAuth } from '@/components/AuthProvider';

export function useHuggingFace(provider: string = 'huggingface') {
  const { user } = useAuth();
  // Vérifier immédiatement si le mode cloud est forcé
  const cloudModeForced = isCloudModeForced();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<AIServiceType>(
    cloudModeForced ? 'cloud' : 
    (localStorage.getItem('aiServiceType') as AIServiceType || 'cloud')
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

  // Effet pour gérer le changement forcé vers le cloud
  useEffect(() => {
    if (cloudModeForced && serviceType !== 'cloud') {
      console.log("Mode cloud forcé, mise à jour des préférences");
      setServiceType('cloud');
      localStorage.setItem('aiServiceType', 'cloud');
    }

    const handleStorageChange = () => {
      if (!cloudModeForced) {
        const storedServiceType = localStorage.getItem('aiServiceType') as AIServiceType;
        setServiceType(storedServiceType || 'cloud');
      }
      
      setLocalAIUrl(localStorage.getItem('localAIUrl') || 'http://localhost:8000');
      setLocalProvider(localStorage.getItem('localProvider') as LLMProviderType || 'huggingface');
    };

    return setupServiceModeListener(handleStorageChange);
  }, [cloudModeForced, serviceType]);

  // Effet pour vérifier la compatibilité du navigateur
  useEffect(() => {
    ensureDefaultServiceModeSet(setServiceType);
    
    // Exécuter avec un léger délai pour ne pas bloquer le rendu initial
    const timer = setTimeout(() => {
      checkBrowserCompatibilityAndSetMode(cloudModeForced, setServiceType);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [cloudModeForced]);

  // Fonction principale de génération de texte
  const textGeneration = async (
    options: TextGenerationParameters, 
    userId?: string
  ): Promise<TextGenerationResponse[]> => {
    return generateText(
      options,
      serviceType,
      cloudModeForced,
      localAIUrl,
      localProvider,
      modelDownloadStatus,
      provider,
      setIsLoading,
      setError,
      userId || user?.id
    );
  };

  const setLocalProviderConfig = useCallback((provider: LLMProviderType) => {
    const updatedProvider = configureLocalProvider(provider);
    setLocalProvider(updatedProvider);
    return updatedProvider;
  }, []);

  return { 
    textGeneration, 
    isLoading, 
    error,
    serviceType: cloudModeForced ? 'cloud' : serviceType,
    localAIUrl,
    localProvider,
    checkLocalService,
    setLocalProviderConfig,
    detectLocalServices,
    modelDownloadStatus,
    downloadModel,
    modelsAvailable: []
  };
}
