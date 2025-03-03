
/**
 * Utilitaires liés à l'environnement d'exécution
 * Aide à détecter le contexte d'exécution (local, cloud, preview, etc.)
 */

/**
 * Détermine si l'application est en cours d'exécution en mode preview
 * (sur la plateforme Lovable ou netlify)
 */
export const isPreviewEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname.includes('lovable.ai') || 
         hostname.includes('preview') || 
         hostname.includes('netlify.app');
};

/**
 * Détermine si l'application est en cours d'exécution localement
 */
export const isLocalEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.startsWith('192.168.') ||
         hostname.startsWith('10.0.');
};

/**
 * Formate les paramètres d'URL importants à conserver lors des redirections
 */
export const getFormattedUrlParams = (): string => {
  if (typeof window === 'undefined') return '';
  
  const searchParams = new URLSearchParams(window.location.search);
  const paramsToKeep = ['mode', 'client', 'forceCloud', 'hideDebug', 'cloud'];
  const keepParams = new URLSearchParams();
  
  paramsToKeep.forEach(param => {
    if (searchParams.has(param)) {
      keepParams.append(param, searchParams.get(param) || '');
    }
  });
  
  const paramsString = keepParams.toString();
  return paramsString ? `?${paramsString}` : '';
};

/**
 * Obtient les informations sur l'environnement pour le diagnostic
 */
export const getEnvironmentInfo = () => {
  if (typeof window === 'undefined') {
    return {
      environment: 'server',
      url: null,
      userAgent: null,
      aiServiceType: null,
      forceCloudMode: null
    };
  }
  
  return {
    environment: isPreviewEnvironment() ? 'preview' : isLocalEnvironment() ? 'local' : 'production',
    url: window.location.href,
    userAgent: window.navigator.userAgent,
    aiServiceType: localStorage.getItem('aiServiceType') || 'cloud',
    forceCloudMode: localStorage.getItem('FORCE_CLOUD_MODE') === 'true'
  };
};
