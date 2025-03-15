
/**
 * Environment detection utilities
 */

// Check if the application is running in production mode
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true;
};

// Check if the application is running in development mode
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true;
};

// Check if running in Lovable's platform
export const isLovableEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
    (window.location.hostname.includes('lovable.ai') || 
     window.location.hostname.includes('lovableai.dev'));
};

// Check if running in Netlify's platform
export const isNetlifyEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
    window.location.hostname.includes('netlify.app');
};

// Get all URL parameters as an object
export const getAllUrlParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  const params: Record<string, string> = {};
  const queryString = window.location.search.substring(1);
  
  if (!queryString) return params;
  
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  
  return params;
};

// Get formatted URL parameters string
export const getFormattedUrlParams = (): string => {
  const params = getAllUrlParams();
  if (Object.keys(params).length === 0) return '';
  
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};
