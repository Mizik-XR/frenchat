
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
import { callOllamaService } from './ai/ollamaService';
import { callLocalAPIService } from './ai/localAPIService';
import { callCloudAPIService } from './ai/cloudAPIService';
import { analyzeRequest, estimateSystemCapabilities } from './ai/requestAnalyzer';

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
    detectLocalServices: detectServices
  };
}
