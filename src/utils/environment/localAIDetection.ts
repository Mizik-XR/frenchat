import { LLMProviderType } from "@/types/config";

const OLLAMA_DEFAULT_URL = "http://localhost:11434";
const PYTHON_DEFAULT_URL = "http://localhost:8000";

/**
 * Vérifie si l'environnement est compatible avec une exécution locale de l'IA
 * @returns true si l'environnement est compatible
 */
export function isLocalAIEnvironmentCompatible(): boolean {
  try {
    // Vérifier si nous sommes dans un environnement qui bloque les connexions localhost
    // comme un sandbox, un iframe avec contraintes de sécurité, etc.
    const isIframe = window !== window.parent;
    const isSecureContext = window.isSecureContext;
    const isLocalStorageAvailable = typeof localStorage !== 'undefined';
    
    // Détection plus précise des environnements de prévisualisation
    const isPreviewEnvironment = 
      window.location.hostname.includes('lovable') || 
      window.location.hostname.includes('preview') ||
      window.location.hostname.includes('netlify') ||
      window.location.hostname.includes('stackblitz') ||
      window.location.hostname.includes('codesandbox');
    
    // Détection d'un "reset mode" dans l'URL pour forcer le mode cloud
    const resetMode = window.location.search.includes('reset=true');
    
    // Un paramètre dans l'URL pour forcer le mode cloud
    const forceCloudParam = window.location.search.includes('forceCloud=true');
    
    // Si nous sommes en mode reset ou force cloud, configurer immédiatement
    if (resetMode || forceCloudParam) {
      if (isLocalStorageAvailable) {
        localStorage.setItem('FORCE_CLOUD_MODE', 'true');
        localStorage.setItem('aiServiceType', 'cloud');
        console.log("Mode cloud forcé par paramètre URL");
      }
      return false;
    }
    
    // Les connexions locales sont généralement bloquées dans ces contextes
    const potentiallyRestricted = 
      isPreviewEnvironment ||
      (isIframe && isSecureContext && window.location.hostname !== 'localhost') ||
      (isSecureContext && window.location.protocol === 'https:' && 
       !window.location.hostname.includes('localhost') && 
       !window.location.hostname.includes('127.0.0.1'));
    
    // Vérifier les fonctionnalités qui pourraient indiquer des conflits avec d'autres projets
    const hasVRFeatures = 'xr' in navigator || 'getVRDisplays' in navigator;
    
    // Si nous sommes dans un environnement restrictif ou avec des fonctionnalités VR,
    // les connexions localhost sont probablement bloquées ou il y a des conflits
    if (potentiallyRestricted || hasVRFeatures) {
      console.log("Environnement potentiellement incompatible avec l'IA locale détecté");
      
      // Forcer le mode cloud dans les environnements de prévisualisation ou avec des conflits VR
      if ((isPreviewEnvironment || hasVRFeatures) && isLocalStorageAvailable) {
        localStorage.setItem('FORCE_CLOUD_MODE', 'true');
        localStorage.setItem('aiServiceType', 'cloud');
        console.log("Mode cloud forcé en environnement de prévisualisation ou avec conflits VR");
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de compatibilité:", error);
    // En cas d'erreur, forcer le mode cloud pour éviter d'autres problèmes
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('aiServiceType', 'cloud');
    }
    return false;
  }
}

export async function isOllamaAvailable(): Promise<boolean> {
  // Si l'environnement n'est pas compatible, ne pas tenter la connexion
  if (!isLocalAIEnvironmentCompatible()) {
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${OLLAMA_DEFAULT_URL}/api/version`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log("Erreur lors de la détection d'Ollama:", error);
    return false;
  }
}

export async function isPythonServerAvailable(): Promise<boolean> {
  // Si l'environnement n'est pas compatible, ne pas tenter la connexion
  if (!isLocalAIEnvironmentCompatible()) {
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    // Essayer plusieurs chemins d'API typiques pour un serveur Python
    const endpoints = [
      `${PYTHON_DEFAULT_URL}/health`,
      `${PYTHON_DEFAULT_URL}/api/health`,
      `${PYTHON_DEFAULT_URL}/status`,
      `${PYTHON_DEFAULT_URL}/`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal
        });
        
        if (response.ok) {
          clearTimeout(timeoutId);
          return true;
        }
      } catch {
        // Continuer avec le prochain endpoint
        continue;
      }
    }
    
    clearTimeout(timeoutId);
    return false;
  } catch (error) {
    console.log("Erreur lors de la détection du serveur Python:", error);
    return false;
  }
}

export async function getAvailableOllamaModels(): Promise<string[] | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${OLLAMA_DEFAULT_URL}/api/tags`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.models) {
        return data.models.map((model: any) => model.name);
      }
    }
    
    return null;
  } catch (error) {
    console.log("Erreur lors de la récupération des modèles Ollama:", error);
    return null;
  }
}

export function configureOllama() {
  localStorage.setItem('localProvider', 'ollama');
  localStorage.setItem('localAIUrl', OLLAMA_DEFAULT_URL);
  localStorage.setItem('aiServiceType', 'local');
  console.log("Configuration avec Ollama effectuée");
}

export function configurePythonServer() {
  localStorage.setItem('localProvider', 'transformers');
  localStorage.setItem('localAIUrl', PYTHON_DEFAULT_URL);
  localStorage.setItem('aiServiceType', 'local');
  console.log("Configuration avec le serveur Python effectuée");
}

export async function detectLocalServices() {
  const results = {
    ollama: {
      available: false,
      url: OLLAMA_DEFAULT_URL,
      models: [] as string[]
    },
    python: {
      available: false,
      url: PYTHON_DEFAULT_URL
    }
  };
  
  // Vérifier d'abord si l'environnement est compatible
  if (!isLocalAIEnvironmentCompatible()) {
    console.log("Environnement incompatible avec l'IA locale, passage au mode cloud");
    return results;
  }
  
  // Détection d'Ollama
  results.ollama.available = await isOllamaAvailable();
  if (results.ollama.available) {
    const models = await getAvailableOllamaModels();
    if (models) {
      results.ollama.models = models;
    }
  }
  
  // Détection du serveur Python
  results.python.available = await isPythonServerAvailable();
  
  // Configuration automatique basée sur la disponibilité
  if (results.ollama.available) {
    configureOllama();
  } else if (results.python.available) {
    configurePythonServer();
  }
  
  return results;
}
