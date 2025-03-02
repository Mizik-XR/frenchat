
import { toast } from '@/hooks/use-toast';
import { LLMProviderType } from '@/types/config';

/**
 * Vérifie si le service IA local est disponible
 */
export async function checkLocalService(url: string): Promise<{available: boolean, error?: string}> {
  if (!url) {
    return { available: false, error: "URL non configurée" };
  }
  
  try {
    // Suppression du /generate de l'URL si présent pour l'état
    const baseUrl = url.endsWith('/generate') ? url.substring(0, url.length - 9) : url;
    
    // Pour Ollama, utiliser un point de terminaison différent
    const statusUrl = url.includes('11434') 
      ? `${baseUrl}/api/version` 
      : `${baseUrl}/status`;
    
    // Timeout court pour vérifier rapidement si le service est disponible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return { available: true };
    } else {
      return { 
        available: false, 
        error: `Service non disponible (${response.status})` 
      };
    }
  } catch (error: any) {
    // Si l'erreur est spécifique à CORS, considérer tout de même que le service est disponible
    if (error.name === 'TypeError' && error.message.includes('CORS')) {
      console.log("Erreur CORS détectée, service probablement disponible malgré tout");
      return { available: true };
    }
    
    return { 
      available: false, 
      error: error.name === 'AbortError' 
        ? "Délai d'attente dépassé" 
        : error.message 
    };
  }
}

/**
 * Configure le fournisseur local d'IA
 */
export function setLocalProviderConfig(provider: LLMProviderType): LLMProviderType {
  localStorage.setItem('localProvider', provider);
  
  // Adapter l'URL du service local en fonction du fournisseur
  let localAIUrl = localStorage.getItem('localAIUrl') || 'http://localhost:8000';
  
  if (provider === 'ollama') {
    // Si le provider est Ollama, on adapte l'URL
    if (!localAIUrl.includes('11434')) {
      localAIUrl = 'http://localhost:11434';
      localStorage.setItem('localAIUrl', localAIUrl);
    }
  } else if (provider === 'huggingface') {
    // Si le provider est Hugging Face et qu'on a une URL Ollama, on revient à l'URL par défaut
    if (localAIUrl.includes('11434')) {
      localAIUrl = 'http://localhost:8000';
      localStorage.setItem('localAIUrl', localAIUrl);
    }
  }
  
  return provider;
}

/**
 * Notifie l'utilisateur d'un changement de service
 */
export function notifyServiceChange(
  title: string, 
  description: string, 
  variant: "default" | "destructive" = "default"
) {
  toast({
    title,
    description,
    variant
  });
}

/**
 * Détecte automatiquement les services disponibles
 */
export async function detectLocalServices(): Promise<{
  ollamaAvailable: boolean,
  transformersAvailable: boolean,
  recommendedProvider: LLMProviderType
}> {
  // Vérifier Ollama
  const ollamaAvailable = await checkLocalService('http://localhost:11434').then(
    res => res.available,
    () => false
  );
  
  // Vérifier le serveur Python Transformers
  const transformersAvailable = await checkLocalService('http://localhost:8000').then(
    res => res.available,
    () => false
  );
  
  // Déterminer le fournisseur recommandé
  let recommendedProvider: LLMProviderType = 'huggingface';
  
  if (ollamaAvailable && !transformersAvailable) {
    recommendedProvider = 'ollama';
  } else if (transformersAvailable && !ollamaAvailable) {
    recommendedProvider = 'huggingface';
  } else if (ollamaAvailable && transformersAvailable) {
    // Les deux sont disponibles, préférer Ollama car plus simple pour l'utilisateur
    recommendedProvider = 'ollama';
  }
  
  return {
    ollamaAvailable,
    transformersAvailable,
    recommendedProvider
  };
}
