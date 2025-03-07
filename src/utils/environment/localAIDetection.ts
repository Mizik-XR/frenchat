
import { isNetlifyEnvironment } from './environmentDetection';

/**
 * Vérifie si Ollama est disponible en tentant de contacter son API
 * avec une meilleure gestion des délais d'attente
 * @returns Promise qui résout à true si Ollama est disponible, false sinon
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    // Utiliser AbortController pour limiter le temps de la requête
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Plus de temps pour la détection
    
    const response = await fetch('http://localhost:11434/api/version', { 
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log("Ollama détecté avec succès:", await response.text());
      return true;
    }
    return false;
  } catch (e) {
    console.error("Erreur lors de la détection d'Ollama:", e);
    return false;
  }
}

/**
 * Récupère la liste des modèles disponibles dans Ollama avec gestion améliorée des erreurs
 * @returns Liste des modèles disponibles ou null en cas d'erreur
 */
export async function getAvailableOllamaModels(): Promise<string[] | null> {
  try {
    // Utiliser AbortController pour limiter le temps de la requête
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Plus de temps pour charger les modèles
    
    const response = await fetch('http://localhost:11434/api/tags', { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      // Vérifier la structure de la réponse (peut varier selon les versions d'Ollama)
      if (data.models && Array.isArray(data.models)) {
        return data.models.map((model: any) => model.name);
      } else if (data.tags && Array.isArray(data.tags)) {
        return data.tags.map((tag: any) => tag.name || tag);
      } else {
        console.warn("Structure de réponse Ollama inconnue:", data);
        return Object.keys(data).length > 0 ? ["modèle détecté"] : [];
      }
    }
    return null;
  } catch (e) {
    console.error("Erreur lors de la récupération des modèles Ollama:", e);
    return null;
  }
}

/**
 * Configure automatiquement l'application pour utiliser Ollama
 * avec des paramètres optimisés
 */
export function configureOllama(): void {
  localStorage.setItem('localProvider', 'ollama');
  localStorage.setItem('localAIUrl', 'http://localhost:11434');
  localStorage.setItem('aiServiceType', 'local');
  localStorage.setItem('defaultModel', 'llama2');
  
  // Stocker l'information de détection d'Ollama pour accélérer les chargements futurs
  localStorage.setItem('ollamaDetected', 'true');
  localStorage.setItem('ollamaLastDetected', new Date().toISOString());
  
  console.log("Configuration Ollama enregistrée dans localStorage");
}

/**
 * Vérifie si l'application est dans un environnement compatible avec l'IA locale
 */
export function isLocalAIEnvironmentCompatible(): boolean {
  // L'IA locale ne peut pas s'exécuter directement sur Netlify
  if (isNetlifyEnvironment()) {
    // Mais l'application Netlify peut se connecter à une IA locale sur la machine de l'utilisateur
    console.log("Environnement Netlify détecté - l'IA locale peut être utilisée via l'interface web");
    return true;
  }
  // En local, toujours compatible
  return true;
}

/**
 * Vérifie si Ollama a été récemment détecté (cache pour éviter des appels répétés)
 * avec une période de validité plus courte pour une meilleure réactivité
 */
export function hasRecentOllamaDetection(): boolean {
  const lastDetected = localStorage.getItem('ollamaLastDetected');
  if (!lastDetected) return false;
  
  // Considérer la détection valide pendant 5 minutes (réduit pour mettre à jour plus souvent)
  const lastDetectionTime = new Date(lastDetected).getTime();
  const now = new Date().getTime();
  const timeDiff = now - lastDetectionTime;
  const isRecent = timeDiff < 5 * 60 * 1000; // 5 minutes
  
  return isRecent && localStorage.getItem('ollamaDetected') === 'true';
}

/**
 * Configure le fallback vers un serveur Python local si Ollama n'est pas disponible
 */
export function configurePythonServer(): void {
  localStorage.setItem('localProvider', 'python');
  localStorage.setItem('localAIUrl', 'http://localhost:8000');
  localStorage.setItem('aiServiceType', 'local');
  
  console.log("Configuration du serveur Python local enregistrée dans localStorage");
}

/**
 * Vérifie si un serveur Python local est disponible
 */
export async function isPythonServerAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('http://localhost:8000/api/status', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (e) {
    console.error("Erreur lors de la détection du serveur Python:", e);
    return false;
  }
}
