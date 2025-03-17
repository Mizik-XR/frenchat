
/**
 * appState.ts
 * 
 * Ce fichier contient l'état global de l'application et les fonctions utilitaires
 * liées à la détection de connectivité et au mode hors ligne.
 * 
 * Il sert de source unique pour ces constantes afin d'éviter les exports multiples
 * et les dépendances circulaires.
 */

// Type d'état de l'application
export interface AppState {
  isOfflineMode: boolean;
  lastError?: Error | null;
  supbaseErrors: Error[];
  setOfflineMode: (offline: boolean) => void;
  logSupabaseError: (error: Error) => void;
  hasSupabaseError?: boolean;
  lastSupabaseError?: Error | null;
}

// Application state singleton
export const APP_STATE: AppState = {
  isOfflineMode: false,
  supbaseErrors: [],
  setOfflineMode: (offline: boolean) => {
    APP_STATE.isOfflineMode = offline;
    if (typeof window !== 'undefined') {
      localStorage.setItem('OFFLINE_MODE', offline ? 'true' : 'false');
      window.dispatchEvent(new Event('storage'));
    }
  },
  logSupabaseError: (error: Error) => {
    APP_STATE.lastError = error;
    APP_STATE.lastSupabaseError = error;
    APP_STATE.supbaseErrors.push(error);
    APP_STATE.hasSupabaseError = true;
    console.error("Supabase error logged:", error);
    
    // Limiter le nombre d'erreurs stockées
    if (APP_STATE.supbaseErrors.length > 20) {
      APP_STATE.supbaseErrors.shift();
    }
  }
};

// Vérifier si on devrait utiliser le mode hors ligne
export const checkOfflineMode = () => {
  if (typeof window !== 'undefined') {
    const savedOfflineMode = localStorage.getItem('OFFLINE_MODE');
    if (savedOfflineMode === 'true') {
      APP_STATE.isOfflineMode = true;
    }
  }
};

// Détection des services AI
export const detectLocalAIService = async (): Promise<{ available: boolean; url: string | null; provider?: string }> => {
  if (APP_STATE.isOfflineMode) return { available: false, url: null };
  
  try {
    // Si déjà en mode hors ligne, ignore la détection
    if (APP_STATE.isOfflineMode) {
      console.log("Mode hors ligne activé, utilisation du service cloud par défaut");
      localStorage.setItem('aiServiceType', 'cloud');
      return { available: false, url: null };
    }
    
    // Teste d'abord Ollama, qui est prioritaire
    try {
      const ollamaAvailable = await fetch('http://localhost:11434/api/version', {
        signal: AbortSignal.timeout(1500)
      });
      
      if (ollamaAvailable.ok) {
        console.log("Service Ollama détecté à http://localhost:11434");
        localStorage.setItem('aiServiceType', 'local');
        localStorage.setItem('localAIUrl', 'http://localhost:11434');
        localStorage.setItem('localProvider', 'ollama');
        return { available: true, url: 'http://localhost:11434', provider: 'ollama' };
      }
    } catch (e) {
      console.log("Ollama non détecté:", e instanceof Error ? e.message : String(e));
    }
    
    // Teste ensuite le serveur Python local
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Timeout après 2 secondes
    
    const localBaseUrls = [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      // Ajoutez d'autres ports potentiels si nécessaire
    ];
    
    let localAIAvailable = false;
    let localAIUrl = '';
    
    for (const url of localBaseUrls) {
      try {
        console.log(`Tentative de connexion à ${url}/health...`);
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        
        if (response.ok) {
          localAIAvailable = true;
          localAIUrl = url;
          console.log(`Service d'IA local détecté: ${url}`);
          break;
        }
      } catch (e) {
        console.log(`Échec de connexion à ${url}: ${e instanceof Error ? e.message : String(e)}`);
        // Ignore les erreurs et continue avec l'URL suivante
        continue;
      }
    }
    
    clearTimeout(timeoutId);
    
    if (localAIAvailable) {
      console.log("Service d'IA Python local détecté:", localAIUrl);
      localStorage.setItem('aiServiceType', 'local');
      localStorage.setItem('localAIUrl', localAIUrl);
      localStorage.setItem('localProvider', 'python');
      return { available: true, url: localAIUrl, provider: 'python' };
    } else {
      console.log("Aucun service d'IA local détecté, utilisation du service cloud");
      localStorage.setItem('aiServiceType', 'cloud');
      localStorage.removeItem('localAIUrl');
      return { available: false, url: null };
    }
  } catch (error) {
    console.error("Erreur lors de la détection du service d'IA local:", error);
    localStorage.setItem('aiServiceType', 'cloud');
    return { available: false, url: null };
  }
};
