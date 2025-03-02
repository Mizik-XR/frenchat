
import { toast } from '@/hooks/use-toast';
import { LLMProviderType } from '@/types/config';

/**
 * Utilitaires pour les services d'IA
 */

/**
 * Vérifie la disponibilité d'un service local
 */
export async function checkLocalService(
  url: string, 
  timeout: number = 5000
): Promise<{ available: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return { 
        available: true, 
        message: "Service local disponible et fonctionnel" 
      };
    } else {
      return { 
        available: false, 
        message: `Erreur du service: ${response.status} ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      available: false, 
      message: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

/**
 * Configure le fournisseur local
 */
export function setLocalProviderConfig(provider: LLMProviderType): LLMProviderType {
  localStorage.setItem('localProvider', provider);
  return provider;
}

/**
 * Détecte les services locaux disponibles
 */
export async function detectLocalServices(): Promise<{
  huggingface: boolean;
  ollama: boolean;
  custom: boolean;
}> {
  const huggingfaceAvailable = await checkLocalService('http://localhost:8000')
    .then(result => result.available)
    .catch(() => false);
  
  const ollamaAvailable = await checkLocalService('http://localhost:11434')
    .then(result => result.available)
    .catch(() => false);
  
  return {
    huggingface: huggingfaceAvailable,
    ollama: ollamaAvailable,
    custom: false // Par défaut, pas de service personnalisé détecté
  };
}

/**
 * Notifie l'utilisateur d'un changement de service
 */
export function notifyServiceChange(
  title: string,
  message: string,
  variant: "default" | "destructive" = "default"
): void {
  toast({
    title,
    description: message,
    variant
  });
}
