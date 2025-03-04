
import { supabase } from "@/integrations/supabase/client";
import { getBaseUrl, isPreviewEnvironment, isDevelopment } from "@/utils/environmentUtils";

const getApiUrl = () => {
  const configuredApiUrl = import.meta.env.VITE_API_URL;
  
  // Si une URL API est explicitement configurée, l'utiliser
  if (configuredApiUrl) {
    return configuredApiUrl;
  }
  
  // En environnement de prévisualisation, utiliser un chemin relatif
  if (isPreviewEnvironment()) {
    return `${getBaseUrl()}/api`;
  }
  
  // Par défaut en développement local
  return 'http://localhost:8000';
};

const API_URL = getApiUrl();
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';

export const apiConfig = {
  baseURL: API_URL,
  isProduction: ENVIRONMENT === 'production',
  
  async getHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
    };
  },

  endpoints: {
    textGeneration: '/generate',
    modelInfo: '/model-info',
  }
};

// Journaliser la configuration API une seule fois au démarrage
console.log("Configuration API:", {
  url: apiConfig.baseURL,
  environment: ENVIRONMENT,
  isPreview: isPreviewEnvironment(),
  isDev: isDevelopment()
});

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

// Fonction pour envoyer des requêtes API sécurisées
export const secureApiRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  try {
    const headers = await apiConfig.getHeaders();
    
    // Ne pas envoyer de corps pour les requêtes GET
    const options: RequestInit = {
      method,
      headers,
      ...(method !== 'GET' && data ? { body: JSON.stringify(data) } : {})
    };
    
    // Log sécurisé (sans données sensibles)
    if (!apiConfig.isProduction) {
      console.log(`API Request to ${endpoint}:`, {
        method,
        fullUrl: `${apiConfig.baseURL}${endpoint}`,
        ...(data ? { body: sanitizeForLogs(data) } : {})
      });
    }
    
    const url = `${apiConfig.baseURL}${endpoint}`;
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`Error in API request to ${endpoint}:`, error.message);
    throw error;
  }
};
