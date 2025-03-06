
import { APP_STATE } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Vérifie la connectivité avec un service local
 * @param url URL du service à tester
 * @param timeout Délai avant abandon (ms)
 * @returns Résultat du test et message
 */
export async function checkLocalServiceConnectivity(
  url: string,
  endpoint: string = '/health',
  timeout: number = 3000
): Promise<{success: boolean, message: string}> {
  console.log(`Vérification de la connexion au service local: ${url}${endpoint}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${url}${endpoint}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`Service local disponible à ${url}`);
      
      // Tentative de récupération d'informations supplémentaires
      let details = "";
      try {
        const data = await response.json();
        details = data.status || data.message || "Service opérationnel";
      } catch (e) {
        details = "Service disponible";
      }
      
      return {
        success: true,
        message: details
      };
    } else {
      console.warn(`Service local non disponible: ${response.status} ${response.statusText}`);
      return {
        success: false,
        message: `Erreur ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    console.error(`Erreur lors de la connexion au service local:`, error);
    
    // Détection des erreurs de connexion refusée (ECONNREFUSED)
    let errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    const isConnectionRefused = errorMessage.includes('ECONNREFUSED') || 
                               errorMessage.includes('Failed to fetch') ||
                               errorMessage.includes('NetworkError') ||
                               error instanceof DOMException;
    
    if (isConnectionRefused) {
      return {
        success: false,
        message: `Connexion refusée - Le service n'est probablement pas démarré sur ${url}`
      };
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Met l'application en mode hors ligne et notifie l'utilisateur
 */
export function enableOfflineMode(reason: string): void {
  if (!APP_STATE.isOfflineMode) {
    console.log(`Activation du mode hors ligne: ${reason}`);
    APP_STATE.isOfflineMode = true;
    
    toast({
      title: "Mode hors ligne activé",
      description: `Raison: ${reason}. Certaines fonctionnalités seront limitées.`,
      variant: "default" // Changé de "warning" à "default"
    });
  }
}

/**
 * Tente automatiquement de détecter les services locaux disponibles
 * @returns Liste des services détectés
 */
export async function autoDetectLocalServices(): Promise<{[key: string]: boolean}> {
  const services = {
    huggingface: false,
    ollama: false,
    custom: false
  };
  
  // Test des différentes URLs possibles
  const endpoints = [
    { name: 'huggingface', url: 'http://localhost:8000' },
    { name: 'ollama', url: 'http://localhost:11434' },
    { name: 'custom', url: 'http://localhost:3000' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await checkLocalServiceConnectivity(endpoint.url);
    services[endpoint.name] = result.success;
    console.log(`Service ${endpoint.name}: ${result.success ? 'Disponible' : 'Non disponible'}`);
  }
  
  return services;
}
