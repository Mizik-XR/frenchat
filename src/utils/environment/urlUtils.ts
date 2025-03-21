
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

export default {
  isDevelopment,
  getBaseUrl,
  getFullUrl,
  getRedirectUrl,
  getSupabaseApiUrl
};
