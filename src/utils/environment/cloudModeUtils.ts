
/**
 * Utilitaires pour la gestion du mode cloud
 */

// Vérifier si l'application fonctionne en mode cloud
export function isCloudMode(): boolean {
  return import.meta.env.VITE_CLOUD_MODE === 'true' || 
         Boolean(import.meta.env.VITE_CLOUD_API_URL) ||
         Boolean(window.localStorage.getItem('CLOUD_MODE')) === true;
}

// Activer ou désactiver le mode cloud
export function toggleCloudMode(enable: boolean): void {
  if (enable) {
    window.localStorage.setItem('CLOUD_MODE', 'true');
  } else {
    window.localStorage.removeItem('CLOUD_MODE');
  }
}

// Obtenir l'URL de base de l'API cloud
export function getApiBaseUrl(): string {
  const cloudApiUrl = import.meta.env.VITE_CLOUD_API_URL;
  if (cloudApiUrl) {
    return cloudApiUrl;
  }
  
  // Utiliser une URL par défaut si aucune n'est définie
  return '/api';
}

// Créer des en-têtes adaptés au mode cloud
export function createCloudModeHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Cloud-Mode': 'true'
  };
}

// Déterminer si une requête doit utiliser le mode cloud
export function shouldUseCloudMode(endpoint: string): boolean {
  // Exemples d'endpoints qui devraient toujours utiliser le mode cloud
  const cloudOnlyEndpoints = [
    '/api/cloud/',
    '/api/models/',
    '/api/embeddings/'
  ];
  
  return isCloudMode() || cloudOnlyEndpoints.some(e => endpoint.includes(e));
}

// Récupérer les préférences d'environnement Lovable
export function getLovableEnvironmentPreferences() {
  return {
    enableSupabase: localStorage.getItem('ENABLE_SUPABASE_IN_LOVABLE') === 'true',
    enableLocalAI: localStorage.getItem('ENABLE_LOCAL_AI_IN_LOVABLE') === 'true'
  };
}

// Définir les préférences d'environnement Lovable
export function setLovableEnvironmentPreferences(enableSupabase: boolean, enableLocalAI: boolean) {
  if (enableSupabase) {
    localStorage.setItem('ENABLE_SUPABASE_IN_LOVABLE', 'true');
  } else {
    localStorage.removeItem('ENABLE_SUPABASE_IN_LOVABLE');
  }
  
  if (enableLocalAI) {
    localStorage.setItem('ENABLE_LOCAL_AI_IN_LOVABLE', 'true');
  } else {
    localStorage.removeItem('ENABLE_LOCAL_AI_IN_LOVABLE');
  }
}
