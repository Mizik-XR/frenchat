
/**
 * Utilitaire pour gérer les problèmes de CORS dans les environnements de prévisualisation
 */

// Vérifier si nous sommes dans un environnement qui nécessite un proxy CORS
export function needsCorsProxy(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.location.hostname.includes('lovable') || 
         window.location.hostname.includes('preview') ||
         import.meta.env.VITE_CORS_PROXY === 'true';
}

// Appliquer un proxy CORS à une URL si nécessaire
export function applyCorsProxy(url: string): string {
  if (!needsCorsProxy()) return url;
  
  // Si déjà un proxy ou une URL relative, ne pas modifier
  if (url.startsWith('https://cors-anywhere.herokuapp.com/') || 
      url.startsWith('/') || 
      url.startsWith('http://localhost')) {
    return url;
  }
  
  // Utiliser un proxy CORS public (à remplacer par votre propre proxy en production)
  return `https://cors-anywhere.herokuapp.com/${url}`;
}

// Créer des en-têtes fetch qui fonctionnent dans les environnements de prévisualisation
export function createCorsHeaders(additionalHeaders = {}): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Requested-With': 'XMLHttpRequest',
    ...additionalHeaders
  };
}

// Wrapper de fetch qui gère automatiquement les problèmes de CORS
export async function corsSafeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const proxyUrl = needsCorsProxy() ? applyCorsProxy(url) : url;
  
  const corsOptions: RequestInit = {
    ...options,
    headers: {
      ...createCorsHeaders(options.headers),
      ...(options.headers || {})
    },
    mode: needsCorsProxy() ? 'cors' : (options.mode || 'cors')
  };
  
  try {
    return await fetch(proxyUrl, corsOptions);
  } catch (error) {
    console.error(`Erreur lors de la requête CORS vers ${url}:`, error);
    throw error;
  }
}
