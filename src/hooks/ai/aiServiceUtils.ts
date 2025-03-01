
import { toast } from '@/hooks/use-toast';
import { LLMProviderType } from '@/types/config';

/**
 * Utility functions for AI service detection and configuration
 */

// Vérifier si le service local est disponible
export const checkLocalService = async (url?: string): Promise<boolean> => {
  const serviceUrl = url || localStorage.getItem('localAIUrl') || 'http://localhost:8000';
  if (!serviceUrl) return false;
  
  try {
    // Vérifier d'abord si le service est Ollama
    if (serviceUrl.includes('11434')) {
      try {
        const response = await fetch(`${serviceUrl}/api/version`, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // Timeout de 2 secondes
        });
        return response.ok;
      } catch (e) {
        console.warn("Service Ollama indisponible:", e);
      }
    }
    
    // Sinon, essayer avec l'endpoint health de notre API locale
    const localProvider = localStorage.getItem('localProvider') as LLMProviderType || 'huggingface';
    const endpoint = localProvider === 'ollama' 
      ? `${serviceUrl}/api/health` 
      : `${serviceUrl}/health`;
    
    const response = await fetch(endpoint, { 
      method: 'GET',
      signal: AbortSignal.timeout(2000) // Timeout de 2 secondes
    });
    return response.ok;
  } catch (e) {
    console.warn("Service local indisponible:", e);
    return false;
  }
};

// Configurer le fournisseur local
export const setLocalProviderConfig = (provider: LLMProviderType) => {
  localStorage.setItem('localProvider', provider);
  return provider;
};

// Vérifier et mettre à jour le statut du service local automatiquement
export const detectLocalServices = async (): Promise<boolean> => {
  // Vérifier d'abord Ollama qui est le plus simple
  const ollamaUrl = 'http://localhost:11434';
  const isOllamaAvailable = await checkLocalService(ollamaUrl);
  
  if (isOllamaAvailable) {
    console.log("Ollama détecté automatiquement");
    localStorage.setItem('localAIUrl', ollamaUrl);
    localStorage.setItem('localProvider', 'ollama');
    return true;
  }
  
  // Sinon, vérifier notre serveur FileChat
  const fileChatUrl = 'http://localhost:8000'; 
  const isFileChatAvailable = await checkLocalService(fileChatUrl);
  
  if (isFileChatAvailable) {
    console.log("Serveur FileChat détecté automatiquement");
    localStorage.setItem('localAIUrl', fileChatUrl);
    localStorage.setItem('localProvider', 'huggingface');
    return true;
  }
  
  return false;
};

// Fonction pour notifier l'utilisateur d'un changement de service
export const notifyServiceChange = (message: string, description: string, variant: 'default' | 'destructive' = 'default') => {
  toast({
    title: message,
    description,
    variant
  });
};
