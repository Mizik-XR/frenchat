
/**
 * Utilities for handling URLs in different environments
 */

/**
 * Gets the base URL of the current application
 * @returns The base URL, e.g., https://example.com
 */
export const getBaseUrl = (): string => {
  return window.location.origin;
};

/**
 * Returns a fully-qualified redirect URL for OAuth flows
 * @param path The path to append to the base URL (e.g., 'auth/callback')
 * @returns The complete redirect URL
 */
export const getRedirectUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${path.startsWith('/') ? path.substring(1) : path}`;
};

/**
 * Gets a normalized URL for cloud mode access
 * @param endpoint The endpoint to access
 * @returns The complete URL
 */
export const getNormalizedCloudModeUrl = (endpoint: string): string => {
  // API URL from environment, fallback to localhost
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${apiUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
};

/**
 * Determines if the application is running on a specific domain
 * @param domain The domain to check for (e.g., 'vercel.app')
 * @returns True if the app is running on the specified domain
 */
export const isRunningOnDomain = (domain: string): boolean => {
  return window.location.hostname.includes(domain);
};

/**
 * Creates a URL with query parameters
 * @param baseUrl The base URL
 * @param params Object containing query parameters
 * @returns URL with query parameters
 */
export const createUrlWithParams = (baseUrl: string, params: Record<string, string>): string => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};
