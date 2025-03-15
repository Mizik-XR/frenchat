
/**
 * Utilitaires pour la gestion des URLs et des redirections dans l'application
 */

export const getBaseUrl = (): string => {
  // Utiliser en priorité l'URL du site configurée
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL;
  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }
  
  // Si nous sommes en développement, utiliser localhost
  if (import.meta.env.DEV) {
    return window.location.protocol + '//' + window.location.host;
  }
  
  // Sinon, utiliser l'URL actuelle (en production)
  return window.location.origin;
};

export const getRedirectUrl = (path: string): string => {
  return `${getBaseUrl()}/${path}`;
};

export const getFormattedUrlParams = (): string => {
  const params = new URLSearchParams(window.location.search);
  
  // Filtrer et ne conserver que les paramètres utiles
  const usefulParams = ['client', 'forceCloud', 'mode', 'hideDebug'];
  const filteredParams = new URLSearchParams();
  
  usefulParams.forEach(param => {
    if (params.has(param)) {
      filteredParams.append(param, params.get(param) as string);
    }
  });
  
  const paramString = filteredParams.toString();
  return paramString ? `?${paramString}` : '';
};

export const getAllUrlParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

export const appendUrlParams = (url: string, params: Record<string, string>): string => {
  const urlObj = new URL(url);
  
  // Ajouter chaque paramètre à l'URL
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });
  
  return urlObj.toString();
};

// Fonction spécifique pour les redirections OAuth de Google
export const getGoogleOAuthRedirectUrl = (): string => {
  const baseRedirectUrl = getRedirectUrl('auth/google/callback');
  const params = getFormattedUrlParams();
  
  // Si nous avons des paramètres, les ajouter à l'URL de redirection
  if (params) {
    return `${baseRedirectUrl}${params}`;
  }
  
  return baseRedirectUrl;
};
