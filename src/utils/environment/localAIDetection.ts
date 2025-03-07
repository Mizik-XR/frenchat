
import { isNetlifyEnvironment } from './environmentDetection';

/**
 * Vérifie si Ollama est disponible en tentant de contacter son API
 * @returns Promise qui résout à true si Ollama est disponible, false sinon
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    // Utiliser AbortController pour limiter le temps de la requête
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('http://localhost:11434/api/version', { 
      signal: controller.signal,
      mode: 'cors'
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
 * Récupère la liste des modèles disponibles dans Ollama
 * @returns Liste des modèles disponibles ou null en cas d'erreur
 */
export async function getAvailableOllamaModels(): Promise<string[] | null> {
  try {
    // Utiliser AbortController pour limiter le temps de la requête
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('http://localhost:11434/api/tags', { 
      signal: controller.signal
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
        return [];
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
 */
export function configureOllama(): void {
  localStorage.setItem('localProvider', 'ollama');
  localStorage.setItem('localAIUrl', 'http://localhost:11434');
  localStorage.setItem('aiServiceType', 'local');
  
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
 */
export function hasRecentOllamaDetection(): boolean {
  const lastDetected = localStorage.getItem('ollamaLastDetected');
  if (!lastDetected) return false;
  
  // Considérer la détection valide pendant 10 minutes
  const lastDetectionTime = new Date(lastDetected).getTime();
  const now = new Date().getTime();
  const timeDiff = now - lastDetectionTime;
  const isRecent = timeDiff < 10 * 60 * 1000; // 10 minutes
  
  return isRecent && localStorage.getItem('ollamaDetected') === 'true';
}
