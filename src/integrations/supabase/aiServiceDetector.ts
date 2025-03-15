
import { APP_STATE } from './appState';

// Détection dynamique du service d'IA locale
export const detectLocalAIService = async () => {
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
