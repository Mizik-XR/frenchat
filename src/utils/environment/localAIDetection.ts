
import { isNetlifyEnvironment } from './environmentDetection';

/**
 * Vérifie si Ollama est disponible en tentant de contacter son API
 * @returns Promise qui résout à true si Ollama est disponible, false sinon
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/version', { 
      signal: AbortSignal.timeout(2000),
      mode: 'cors'
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Récupère la liste des modèles disponibles dans Ollama
 * @returns Liste des modèles disponibles ou null en cas d'erreur
 */
export async function getAvailableOllamaModels(): Promise<string[] | null> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', { 
      signal: AbortSignal.timeout(3000) 
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
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
}

/**
 * Vérifie si l'application est dans un environnement compatible avec l'IA locale
 */
export function isLocalAIEnvironmentCompatible(): boolean {
  // L'IA locale ne peut pas s'exécuter directement sur Netlify
  if (isNetlifyEnvironment()) {
    // Mais l'application Netlify peut se connecter à une IA locale sur la machine de l'utilisateur
    return true;
  }
  // En local, toujours compatible
  return true;
}
