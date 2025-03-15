
/**
 * Utilities for environment detection and configuration
 */

import { isDevelopment, isProduction, isLovableEnvironment, isNetlifyEnvironment, getAllUrlParams, getFormattedUrlParams } from './environmentDetection';
import { 
  getBaseUrl, 
  getRedirectUrl, 
  getNormalizedCloudModeUrl,
  isRunningOnDomain,
  createUrlWithParams
} from './urlUtils';

// Re-export all environment utility functions
export {
  isDevelopment,
  isProduction,
  isLovableEnvironment,
  isNetlifyEnvironment,
  getAllUrlParams,
  getFormattedUrlParams,
  getBaseUrl,
  getRedirectUrl,
  getNormalizedCloudModeUrl,
  isRunningOnDomain,
  createUrlWithParams
};

/**
 * Gets environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  return {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:8080',
    lovableVersion: import.meta.env.VITE_LOVABLE_VERSION || 'dev',
    allowSignup: import.meta.env.VITE_ALLOW_SIGNUP === 'true',
    enableLovableFeatures: import.meta.env.VITE_ENABLE_LOVABLE_FEATURES === 'true',
    // Add other environment variables as needed
  };
};

/**
 * Detects if running in a specific environment
 */
export const isEnvironment = (env: string): boolean => {
  return import.meta.env.VITE_ENVIRONMENT === env;
};

/**
 * Checks if the application is running in cloud mode
 */
export const isCloudMode = (): boolean => {
  return localStorage.getItem('CLOUD_MODE') === 'true';
};

/**
 * Toggles cloud mode setting
 */
export const toggleCloudMode = (value?: boolean): void => {
  const newValue = value !== undefined ? value : !isCloudMode();
  localStorage.setItem('CLOUD_MODE', newValue ? 'true' : 'false');
  
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('CLOUD_MODE_CHANGE'));
};
