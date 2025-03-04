
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

// Détecter si nous sommes en mode preview (Lovable, Vercel, Netlify, etc.)
export const isPreviewEnvironment = () => {
  // Liste des domaines des environnements de prévisualisation connus
  const previewDomains = [
    'preview', 'lovable', 'vercel', 'netlify', 'gpteng', 
    'preview.app', 'staging', 'dev-', 'test-'
  ];
  
  // Vérifier si l'un des domaines de prévisualisation est présent dans l'URL
  return previewDomains.some(domain => 
    window.location.hostname.includes(domain) || 
    window.location.pathname.includes('/projects/')
  );
};

// Déterminer le chemin de base pour les ressources statiques
export const getPublicPath = () => {
  // En mode preview Lovable ou autres prévisualisations, utiliser le chemin relatif
  if (isPreviewEnvironment()) {
    return './';
  }
  
  // En développement local ou production, utiliser le chemin standard
  return '/';
};

/**
 * Construit une URL de redirection complète basée sur l'environnement actuel
 */
export const getRedirectUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  // S'assurer qu'il n'y a pas de double slash entre baseUrl et path
  const formattedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Construire l'URL complète
  return `${baseUrl}/${formattedPath}`;
};

/**
 * Obtient l'URL de base en fonction de l'environnement
 * Cette fonction est critique pour le routage correct dans différents environnements
 */
export const getBaseUrl = () => {
  // Si on est en mode preview
  if (isPreviewEnvironment()) {
    // Cas spécifique pour Lovable avec extraction de l'ID du projet
    if (window.location.hostname.includes('lovable') || window.location.hostname.includes('gpteng')) {
      // Recherche du pattern /projects/{projectId} dans l'URL
      const projectMatch = window.location.pathname.match(/\/projects\/([^\/]+)/);
      if (projectMatch && projectMatch[1]) {
        // Retourner l'URL complète avec l'ID du projet
        return `${window.location.origin}/projects/${projectMatch[1]}`;
      }
    }
    
    // Pour d'autres environnements de prévisualisation (Vercel, Netlify, etc.)
    // On extrait uniquement les premiers segments du chemin qui sont pertinents
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    // Si nous avons au moins un segment, le considérer comme partie de l'URL de base
    if (pathSegments.length > 0) {
      // Pour les chemins de type /demo/something ou /preview/something
      // Nous voulons conserver le premier segment comme base
      return `${window.location.origin}/${pathSegments[0]}`;
    }
    
    // Sinon, retourner simplement l'origine
    return window.location.origin;
  }
  
  // En développement local
  if (isDevelopment()) {
    return import.meta.env.VITE_SITE_URL || 'http://localhost:8080';
  }
  
  // En production
  return import.meta.env.VITE_SITE_URL || window.location.origin;
};

// Obtenir la configuration API selon l'environnement
export const getApiConfig = () => {
  // API URL en fonction de l'environnement
  let apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl) {
    // En environnement de prévisualisation, utiliser le chemin relatif /api
    if (isPreviewEnvironment()) {
      apiUrl = `${getBaseUrl()}/api`;
    } else {
      // Par défaut pour le développement local
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

// Fonction utilitaire pour corriger les chemins des ressources statiques
export const fixAssetPath = (path: string): string => {
  if (!path) return path;
  
  // Si déjà un chemin relatif ou URL absolue, ne pas modifier
  if (path.startsWith('./') || path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Transformer les chemins absolus en chemins relatifs dans les environnements de prévisualisation
  if (isPreviewEnvironment() && path.startsWith('/')) {
    return `.${path}`;
  }
  
  return path;
};
