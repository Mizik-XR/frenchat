
import { LLMProviderType } from "@/types/config";

const OLLAMA_DEFAULT_URL = "http://localhost:11434";
const PYTHON_DEFAULT_URL = "http://localhost:8000";

export async function isOllamaAvailable(): Promise<boolean> {
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
