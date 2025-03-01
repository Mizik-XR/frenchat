
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { LLMProviderType } from '@/types/config';
import { 
  TextGenerationParameters, 
  TextGenerationResponse,
  AIServiceType,
  ModelDownloadStatus
} from './ai/types';
import { 
  checkLocalService,
  setLocalProviderConfig as setProviderConfig,
  detectLocalServices as detectServices,
  notifyServiceChange
} from './ai/aiServiceUtils';
import { callOllamaService } from './ai/ollamaService';
import { callLocalAPIService } from './ai/localAPIService';
import { callCloudAPIService } from './ai/cloudAPIService';
import { analyzeRequest, estimateSystemCapabilities, checkBrowserCompatibility } from './ai/requestAnalyzer';

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
  const [systemCapabilitiesCache, setSystemCapabilitiesCache] = useState<{
    lastCheck: number;
    capabilities: any;
  } | null>(null);
  const [modelDownloadStatus, setModelDownloadStatus] = useState<ModelDownloadStatus | null>(null);
  const [modelsAvailable, setModelsAvailable] = useState<Array<{id: string, name: string, description: string}>>([]);

  // Écouter les changements de type de service et de fournisseur local
  useEffect(() => {
    const handleStorageChange = () => {
      setServiceType(localStorage.getItem('aiServiceType') as AIServiceType || 'cloud');
      setLocalAIUrl(localStorage.getItem('localAIUrl') || 'http://localhost:8000');
      setLocalProvider(localStorage.getItem('localProvider') as LLMProviderType || 'huggingface');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Vérifier si le navigateur est compatible avec l'exécution locale
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

  // Vérifier périodiquement l'état du téléchargement du modèle si en cours
  useEffect(() => {
    let intervalId: number;
    
    const checkDownloadProgress = async () => {
      if (serviceType === 'local' && localAIUrl) {
        try {
          const response = await fetch(`${localAIUrl}/download-progress`);
          if (response.ok) {
            const status = await response.json();
            setModelDownloadStatus(status);
            
            // Si le téléchargement est terminé, notifier l'utilisateur
            if (status.status === 'completed' && modelDownloadStatus?.status === 'downloading') {
              toast({
                title: "Téléchargement terminé",
                description: `Le modèle ${status.model} a été téléchargé avec succès.`,
                variant: "default"
              });
              
              // Afficher le temps total de téléchargement
              const downloadTime = ((status.completed_at - status.started_at) / 60).toFixed(1);
              console.log(`Téléchargement terminé en ${downloadTime} minutes`);
              
              // Actualiser la liste des modèles disponibles
              fetchAvailableModels();
            }
            
            // Si le téléchargement a échoué, notifier l'utilisateur
            if (status.status === 'error' && modelDownloadStatus?.status === 'downloading') {
              toast({
                title: "Erreur de téléchargement",
                description: `Le téléchargement du modèle a échoué: ${status.error}`,
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du téléchargement:", error);
        }
      }
    };
    
    // Vérifier immédiatement
    checkDownloadProgress();
    
    // Puis vérifier périodiquement si le téléchargement est en cours
    if (modelDownloadStatus?.status === 'downloading') {
      intervalId = window.setInterval(checkDownloadProgress, 3000);
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [serviceType, localAIUrl, modelDownloadStatus?.status]);

  // Récupérer la liste des modèles disponibles au démarrage
  useEffect(() => {
    fetchAvailableModels();
  }, [localAIUrl, serviceType]);

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
    setSystemCapabilitiesCache({
      lastCheck: now,
      capabilities
    });
    
    return capabilities;
  };

  // Récupérer la liste des modèles disponibles
  const fetchAvailableModels = async () => {
    if (serviceType === 'local' && localAIUrl) {
      try {
        const response = await fetch(`${localAIUrl}/models`);
        if (response.ok) {
          const data = await response.json();
          setModelsAvailable(data.available || []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des modèles:", error);
      }
    }
  };

  // Démarrer le téléchargement d'un modèle
  const downloadModel = async (modelId: string) => {
    if (serviceType !== 'local' || !localAIUrl) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le modèle en mode cloud",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Demander confirmation avec la taille estimée
      const estimatedSize = modelId.includes('Mixtral') ? 26 : 13; // GB
      
      // Vérifier si le téléchargement est déjà en cours
      if (modelDownloadStatus?.status === 'downloading') {
        toast({
          title: "Téléchargement en cours",
          description: `Le téléchargement du modèle ${modelDownloadStatus.model} est déjà en cours (${modelDownloadStatus.progress}%)`,
        });
        return false;
      }
      
      const response = await fetch(`${localAIUrl}/download-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          consent: true
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setModelDownloadStatus(data);
        
        toast({
          title: "Téléchargement démarré",
          description: `Le modèle ${modelId} est en cours de téléchargement (environ ${estimatedSize} GB)`,
        });
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Erreur lors du téléchargement");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement du modèle:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du téléchargement du modèle",
        variant: "destructive"
      });
      return false;
    }
  };

  // Fonction principale pour la génération de texte
  const textGeneration = async (options: TextGenerationParameters): Promise<TextGenerationResponse[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Analyser la requête pour déterminer sa complexité
      const requestProfile = analyzeRequest(options);
      
      // Vérifier les capacités du système si nécessaire
      let forceCloudExecution = false;
      
      if (requestProfile.complexity === 'high' || 
          requestProfile.complexity === 'medium') {
        const systemCapabilities = await getSystemCapabilities();
        
        // Forcer l'exécution cloud si le système n'est pas assez puissant
        if (!systemCapabilities.recommendLocalExecution) {
          forceCloudExecution = true;
          console.log("Capacités système insuffisantes, forçage du mode cloud");
        }
      }
      
      // Si la requête est complexe ou le système pas assez puissant, utiliser le cloud
      // même si l'utilisateur a configuré le mode local
      if ((requestProfile.recommendedExecution === 'cloud' || forceCloudExecution) && 
          serviceType === 'local') {
        console.log(`Basculement automatique vers le cloud pour une requête complexe (${requestProfile.complexity}, ${requestProfile.estimatedTokens} tokens)`);
        
        // Informer l'utilisateur du basculement (uniquement pour les requêtes complexes)
        if (requestProfile.complexity === 'high') {
          notifyServiceChange(
            "Utilisation du service cloud",
            "Cette requête complexe est traitée par le service cloud pour de meilleures performances.",
            "default"
          );
        }
        
        // Utiliser le service cloud
        return await callCloudAPIService(options, provider);
      }
      
      // Vérifier d'abord si le service local est disponible si nous sommes en mode local
      if (serviceType === 'local') {
        const isLocalAvailable = await checkLocalService(localAIUrl || undefined);
        
        if (isLocalAvailable && localAIUrl) {
          console.log(`Utilisation du service IA local (${localProvider}):`, localAIUrl);
          
          // Vérifier si un téléchargement est en cours
          if (modelDownloadStatus?.status === 'downloading') {
            console.log("Téléchargement de modèle en cours, utilisation du fallback cloud temporaire");
            notifyServiceChange(
              "Modèle en cours de téléchargement", 
              `Le modèle est en cours de téléchargement (${modelDownloadStatus.progress}%). Utilisation temporaire du service cloud.`,
              "default"
            );
            return await callCloudAPIService(options, provider);
          }
          
          // Utiliser Ollama si c'est le fournisseur configuré ou si l'URL contient 11434 (port standard d'Ollama)
          if (localProvider === 'ollama' || localAIUrl.includes('11434')) {
            return await callOllamaService(options, localAIUrl);
          }
          
          // Sinon, utiliser le serveur IA local standard (Hugging Face)
          return await callLocalAPIService(options, localAIUrl);
        } else {
          console.warn("Service local indisponible, passage au service cloud");
          // Si le service local est indisponible, on passe automatiquement au service cloud
          notifyServiceChange(
            "Service local indisponible", 
            "Impossible de se connecter au service IA local. Utilisation du service cloud."
          );
          localStorage.setItem('aiServiceType', 'cloud');
          setServiceType('cloud');
        }
      }
      
      // Si nous sommes ici, c'est que nous utilisons le service cloud
      console.log("Utilisation du service IA cloud via Supabase Functions");
      return await callCloudAPIService(options, provider);
    } catch (e) {
      console.error("Erreur lors de l'appel au modèle:", e);
      setError(e instanceof Error ? e.message : String(e));
      
      // Notification à l'utilisateur
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
    modelsAvailable
  };
}
