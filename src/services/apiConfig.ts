
import { isLocalDevelopment, isLovableEnvironment, isCloudMode, isProduction } from '@/utils/environment/environmentDetection';

/**
 * Configuration des API pour l'application
 */

// Obtenir la base URL pour les appels API
export function getApiBaseUrl(): string {
  // En environnement Lovable, utiliser un endpoint mock ou proxy
  if (isLovableEnvironment()) {
    return '/api/proxy';
  }
  
  // En développement local
  if (isLocalDevelopment()) {
    return 'http://localhost:8000';
  }
  
  // En production ou cloud
  if (isProduction() || isCloudMode()) {
    return import.meta.env.VITE_API_URL || '/api';
  }
  
  // Fallback
  return '/api';
}

// Créer des en-têtes pour les appels API
export function createApiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Ajouter d'autres en-têtes si nécessaire selon l'environnement
  if (isLovableEnvironment()) {
    headers['X-Environment'] = 'lovable';
  }
  
  if (isCloudMode()) {
    headers['X-Mode'] = 'cloud';
  }
  
  return headers;
}

// Configuration de timeout pour les appels API
export const API_TIMEOUT = 30000; // 30 secondes

// Fonction utilitaire pour gérer les timeouts
export function createApiRequestWithTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = API_TIMEOUT
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// Exporter la fonction isLocalDevelopment pour l'utiliser dans d'autres fichiers
export { isLocalDevelopment };

// Fonction sécurisée pour les requêtes API
export async function secureApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createApiHeaders(),
        ...(options.headers || {})
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Secure API request failed:', error);
    throw error;
  }
}
