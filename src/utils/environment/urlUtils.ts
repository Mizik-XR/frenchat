
/**
 * Utilitaires pour la gestion des URLs
 */

/**
 * Détecte l'URL de base de l'application en fonction de l'environnement
 * @returns L'URL de base de l'application
 */
export const getBaseUrl = (): string => {
  // Vérifier si nous sommes dans un navigateur
  if (typeof window === 'undefined') {
    // Côté serveur, utiliser la variable d'environnement ou une valeur par défaut
    return process.env.VITE_SITE_URL || 'http://localhost:8080';
  }

  // Obtenir l'hôte actuel
  const currentHost = window.location.host;
  const isLocalhost = 
    currentHost.includes('localhost') || 
    currentHost.includes('127.0.0.1');
  
  // Déterminer le protocole (http pour localhost, https pour les autres)
  const protocol = isLocalhost ? 'http' : 'https';
  
  return `${protocol}://${currentHost}`;
};

/**
 * Génère une URL de redirection pour l'authentification OAuth
 * @param path Le chemin de redirection (ex: "/auth/google/callback")
 * @returns L'URL complète de redirection
 */
export const getRedirectUrl = (path: string): string => {
  // Supprimer le slash initial si présent pour éviter les doubles slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  // Conserver les paramètres d'URL importants
  const urlParams = getFormattedUrlParams();
  return `${getBaseUrl()}/${cleanPath}${urlParams}`;
};

/**
 * Retourne les paramètres d'URL formatés pour la navigation
 * @param additionalParams Paramètres supplémentaires à inclure
 * @returns Chaîne formatée des paramètres d'URL
 */
export const getFormattedUrlParams = (additionalParams?: Record<string, string>): string => {
  if (typeof window === 'undefined') return '';
  
  // Paramètres à conserver lors des redirections
  const paramsToPersist = ['mode', 'client', 'debug', 'forceCloud', 'hideDebug'];
  const urlParams = new URLSearchParams(window.location.search);
  const persistedParams = new URLSearchParams();
  
  // Copier les paramètres à conserver
  for (const param of paramsToPersist) {
    if (urlParams.has(param)) {
      persistedParams.set(param, urlParams.get(param)!);
    }
  }
  
  // Si mode=cloud est présent, ajouter forceCloud=true
  if (urlParams.get('mode') === 'cloud' && !persistedParams.has('forceCloud')) {
    persistedParams.set('forceCloud', 'true');
  }
  
  // S'assurer que tous les paramètres récurrents sont définis correctement
  if (urlParams.has('client') || persistedParams.has('client')) {
    persistedParams.set('client', 'true');
  }
  
  // Ajouter les paramètres supplémentaires fournis
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      persistedParams.set(key, value);
    });
  }
  
  const paramString = persistedParams.toString();
  return paramString ? `?${paramString}` : '';
};

/**
 * Récupère tous les paramètres d'URL sous forme d'objet
 */
export const getAllUrlParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};

/**
 * Génère une URL complète avec tous les paramètres normalisés pour le mode cloud
 * Utile pour les redirections OAuth et les liens de documentation
 * @param baseUrl URL de base (par défaut: URL actuelle)
 * @returns URL complète avec les paramètres normalisés
 */
export const getNormalizedCloudModeUrl = (path?: string, baseUrl?: string): string => {
  // Utiliser l'URL actuelle comme base par défaut
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
  
  // Paramètres normalisés pour le mode cloud
  const params = {
    client: 'true',
    hideDebug: 'true',
    forceCloud: 'true',
    mode: 'cloud'
  };
  
  // Construire l'URL avec les paramètres normalisés
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  
  // Ajouter le chemin s'il est fourni
  const pathSegment = path ? `/${path.startsWith('/') ? path.substring(1) : path}` : '';
  
  return `${base}${pathSegment}?${searchParams.toString()}`;
};
