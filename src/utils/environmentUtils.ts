
/**
 * Utilitaires pour détecter et gérer les environnements d'exécution
 */

// Détecter si nous sommes en mode développement
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

// Détecter si nous sommes en mode production
export const isProduction = () => {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
};

// Détecter si nous sommes en mode preview (Lovable)
export const isPreviewEnvironment = () => {
  return window.location.hostname.includes('preview') || 
         window.location.hostname.includes('lovable') ||
         window.location.hostname.includes('vercel') ||
         window.location.hostname.includes('netlify') ||
         window.location.hostname.includes('gpteng');
};

// Déterminer le chemin de base pour les ressources statiques
export const getPublicPath = () => {
  // En mode preview Lovable, utiliser le chemin relatif
  if (isPreviewEnvironment()) {
    return './';
  }
  // En développement local, utiliser le chemin standard
  return '/';
};

/**
 * Construit une URL de redirection complète basée sur l'environnement actuel
 * @param path Le chemin relatif à ajouter à l'URL de base
 * @returns L'URL complète de redirection
 */
export const getRedirectUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  // S'assurer qu'il n'y a pas de double slash entre baseUrl et path
  const formattedPath = path.startsWith('/') ? path.substring(1) : path;
  return `${baseUrl}/${formattedPath}`;
};

// Obtenez l'URL de base en fonction de l'environnement
export const getBaseUrl = () => {
  // Si on est en mode preview, utiliser l'origine actuelle
  if (isPreviewEnvironment()) {
    // Détection spécifique pour Lovable
    if (window.location.hostname.includes('lovable')) {
      // Extraire le chemin de base pour Lovable incluant l'ID du projet
      const pathMatch = window.location.pathname.match(/\/projects\/([^\/]+)/);
      if (pathMatch && pathMatch[1]) {
        return `${window.location.origin}/projects/${pathMatch[1]}`;
      }
    }
    
    // Pour les autres environnements de prévisualisation
    const pathParts = window.location.pathname.split('/');
    // Conserver uniquement le domaine et le premier segment si présent (projet ID)
    const basePath = pathParts.length > 1 ? `/${pathParts[1]}` : '';
    return `${window.location.origin}${basePath}`;
  }
  
  // Si on est en mode développement
  if (isDevelopment()) {
    return import.meta.env.VITE_SITE_URL || 'http://localhost:8080';
  }
  
  // En production, utiliser l'URL configurée ou l'origine actuelle
  return import.meta.env.VITE_SITE_URL || window.location.origin;
};

// Obtenir la configuration API selon l'environnement
export const getApiConfig = () => {
  // API URL en fonction de l'environnement
  let apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl) {
    if (isPreviewEnvironment()) {
      apiUrl = `${getBaseUrl()}/api`;
    } else {
      apiUrl = 'http://localhost:8000';
    }
  }
                 
  return {
    baseURL: apiUrl,
    environment: import.meta.env.MODE || (isDevelopment() ? 'development' : 'production')
  };
};

// Vérifier si l'API locale est disponible
export const checkLocalApiAvailability = async (): Promise<boolean> => {
  try {
    // Timeout après 2 secondes pour éviter de bloquer
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.debug("API locale non disponible:", error);
    return false;
  }
};

// Journaliser les informations d'environnement pour le débogage
export const logEnvironmentInfo = () => {
  if (isDevelopment() || isPreviewEnvironment()) {
    console.log("Informations d'environnement:", {
      mode: import.meta.env.MODE || 'non défini',
      isDev: isDevelopment(),
      isProd: isProduction(),
      isPreview: isPreviewEnvironment(),
      baseUrl: getBaseUrl(),
      publicPath: getPublicPath(),
      apiConfig: getApiConfig(),
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      fullUrl: window.location.href
    });
  }
};
