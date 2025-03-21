
/**
 * Utilitaires liés aux URL et à l'environnement de l'application
 */

// Déterminer si nous sommes en environnement de développement
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development' || 
         import.meta.env.DEV === true ||
         window.location.hostname === 'localhost';
};

// Obtenir l'URL de base de l'application
export const getBaseUrl = () => {
  if (isDevelopment()) {
    return 'http://localhost:5173';
  }
  
  return window.location.origin;
};

// Construire une URL complète
export const getFullUrl = (path: string) => {
  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  return `${baseUrl}/${normalizedPath}`;
};

// Obtenir l'URL de redirection pour OAuth
export const getRedirectUrl = (path: string) => {
  return getFullUrl(path);
};

// Obtenir l'URL de l'API Supabase
export const getSupabaseApiUrl = () => {
  return "https://dbdueopvtlanxgumenpu.supabase.co";
};

// Vérifier si une URL est accessible
export const isUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.error(`URL ${url} est inaccessible:`, error);
    return false;
  }
};

// Construire l'URL vers la console Supabase
export const buildSupabaseConsoleUrl = (projectId?: string) => {
  const baseConsoleUrl = 'https://app.supabase.com';
  if (!projectId) {
    // Extraire l'ID du projet de l'URL Supabase si disponible
    const urlMatch = getSupabaseApiUrl().match(/https:\/\/([^.]+)\.supabase\.co/);
    projectId = urlMatch ? urlMatch[1] : '';
  }
  
  return projectId ? `${baseConsoleUrl}/project/${projectId}` : baseConsoleUrl;
};

export default {
  isDevelopment,
  getBaseUrl,
  getFullUrl,
  getRedirectUrl,
  getSupabaseApiUrl,
  isUrlAccessible,
  buildSupabaseConsoleUrl
};
