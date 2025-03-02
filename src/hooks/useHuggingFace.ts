
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
} from './ai/aiServiceUtils';

import { executeAIRequest } from './ai/strategies/aiServiceStrategy';
import { createSystemCapabilitiesManager } from './ai/strategies/systemCapabilitiesStrategy';
import { useModelDownload } from './useModelDownload';
import { checkBrowserCompatibility } from './ai/analyzers/browserCompatibility';
import { createHybridModeActions } from './ai/huggingface/hybridModeActions';
import { handleTextGenerationError, logExecutionStrategy } from './ai/huggingface/errorHandling';

export function useHuggingFace(provider: string = 'huggingface') {
  // Création du gestionnaire de capabilities système
  const { 
    getSystemCapabilities, 
    determineExecutionStrategy,
    isHybridModeEnabled
  } = createSystemCapabilitiesManager();
  
  const hybridModeEnabled = isHybridModeEnabled();
  
  // États du hook
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

  // Fonctionnalités pour le téléchargement de modèles
  const { 
    downloadStatus: modelDownloadStatus, 
    startModelDownload: downloadModel,
    fetchDownloadProgress
  } = useModelDownload();

  // Actions pour le mode hybride
  const {
    enableHybridMode: enableHybrid,
    disableHybridMode: disableHybrid
  } = createHybridModeActions(setServiceType);

  // Effet pour la gestion du mode hybride
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

  // Effet pour vérifier la compatibilité du navigateur
  useEffect(() => {
    const checkCompatibility = () => {
      const browserCompatibility = checkBrowserCompatibility();
      
      // Si le navigateur n'est pas compatible, basculer vers le cloud
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

  // Vérification périodique du service local en mode hybride
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

  // Fonction principale pour la génération de texte
  const textGeneration = async (options: TextGenerationParameters): Promise<TextGenerationResponse[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Déterminer la stratégie d'exécution
      const executionStrategy = await determineExecutionStrategy(options, serviceType);
      
      // Exécuter la requête
      const response = await executeAIRequest(
        options, 
        executionStrategy, 
        localAIUrl, 
        localProvider, 
        modelDownloadStatus, 
        provider
      );
      
      // Logging
      logExecutionStrategy(serviceType, executionStrategy);
      
      return response;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return await handleTextGenerationError(
        e, 
        serviceType, 
        options, 
        localAIUrl, 
        localProvider, 
        modelDownloadStatus, 
        provider
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour configurer le provider local
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
    modelsAvailable: [],
    isHybridMode: serviceType === 'hybrid',
    enableHybridMode: enableHybrid,
    disableHybridMode: disableHybrid
  };
}
