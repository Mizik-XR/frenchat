import { supabase } from "@/integrations/supabase/client";
import { isProduction, isNetlifyEnvironment } from "@/utils/environment/environmentDetection";
import { getApiBaseUrl } from "@/utils/environment/cloudModeUtils";

// Détermination dynamique de l'URL API en fonction de l'environnement
const API_URL = getApiBaseUrl();
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || (isProduction() ? 'production' : 'development');

// Configuration des délais et des tentatives
const REQUEST_TIMEOUT = 60000; // 60 secondes
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 2000; // 2 secondes initiales, puis augmentation exponentielle

export const apiConfig = {
  baseURL: API_URL,
  isProduction: ENVIRONMENT === 'production',
  timeout: REQUEST_TIMEOUT,
  maxRetries: MAX_RETRY_ATTEMPTS,
  
  async getHeaders() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return {
        'Content-Type': 'application/json',
        'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': window.location.origin,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la session:", error);
      return {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': window.location.origin,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      };
    }
  },

  endpoints: {
    textGeneration: '/generate',
    modelInfo: '/model-info',
  }
};

export const isLocalDevelopment = () => ENVIRONMENT === 'development';

// Fonction pour nettoyer les données sensibles avant de les logger
export const sanitizeForLogs = (data: any): any => {
  if (!data) return data;
  
  // Créer une copie profonde de l'objet
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Liste des clés sensibles à masquer
  const sensitiveKeys = ['apiKey', 'api_key', 'password', 'token', 'secret', 'authorization'];
  
  // Fonction récursive pour parcourir l'objet
  const sanitizeObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      // Masquer les valeurs des clés sensibles
      if (sensitiveKeys.some(k => lowerKey.includes(k))) {
        if (typeof obj[key] === 'string' && obj[key]) {
          obj[key] = '********';
        }
      } 
      // Traiter récursivement les objets et tableaux imbriqués
      else if (obj[key] && typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    });
  };
  
  sanitizeObject(sanitized);
  return sanitized;
};

// Fonction pour attendre un délai spécifié avec backoff exponentiel
const delay = (ms: number, retryCount: number) => {
  const exponentialDelay = ms * Math.pow(1.5, retryCount);
  return new Promise(resolve => setTimeout(resolve, exponentialDelay));
};

// Fonction pour envoyer des requêtes API sécurisées avec retry et backoff exponentiel
export const secureApiRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: any,
  retryCount = 0
): Promise<T> => {
  try {
    const headers = await apiConfig.getHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);
    
    // Ne pas envoyer de corps pour les requêtes GET
    const options: RequestInit = {
      method,
      headers,
      signal: controller.signal,
      credentials: 'include',
      mode: 'cors',
      ...(method !== 'GET' && data ? { body: JSON.stringify(data) } : {})
    };
    
    // Log sécurisé (sans données sensibles)
    if (!apiConfig.isProduction) {
      console.log(`API Request to ${endpoint}:`, {
        method,
        ...(data ? { body: sanitizeForLogs(data) } : {})
      });
    }
    
    const url = `${apiConfig.baseURL}${endpoint}`;
    const response = await fetch(url, options);
    
    // Nettoyage du timeout pour éviter les fuites de mémoire
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Gérer les erreurs CORS ou de réseau
      if (response.status === 0 || response.status === 504 || response.status === 408) {
        if (retryCount < apiConfig.maxRetries) {
          console.warn(`Retry ${retryCount + 1}/${apiConfig.maxRetries} for ${endpoint} due to network error (${response.status})`);
          await delay(RETRY_DELAY, retryCount);
          return secureApiRequest(endpoint, method, data, retryCount + 1);
        }
      }
      
      // Tenter de récupérer des informations d'erreur JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
      } catch (jsonError) {
        // Si la réponse n'est pas JSON, utiliser le texte brut ou un message par défaut
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
    }
    
    return await response.json();
  } catch (error: any) {
    // Gérer les erreurs de timeout
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      if (retryCount < apiConfig.maxRetries) {
        console.warn(`Retry ${retryCount + 1}/${apiConfig.maxRetries} for ${endpoint} due to timeout`);
        await delay(RETRY_DELAY, retryCount);
        return secureApiRequest(endpoint, method, data, retryCount + 1);
      }
      throw new Error(`Request to ${endpoint} timed out after ${apiConfig.timeout/1000} seconds (${retryCount} retries attempted)`);
    }
    
    // Gérer l'erreur CORS
    if (error.message?.includes('CORS')) {
      console.error(`CORS error detected for ${endpoint}. Make sure CORS is properly configured on the server.`);
      if (retryCount < apiConfig.maxRetries) {
        console.warn(`Retry ${retryCount + 1}/${apiConfig.maxRetries} for ${endpoint} after CORS error`);
        await delay(RETRY_DELAY, retryCount);
        return secureApiRequest(endpoint, method, data, retryCount + 1);
      }
    }
    
    console.error(`Error in API request to ${endpoint}:`, error.message);
    throw error;
  }
};
