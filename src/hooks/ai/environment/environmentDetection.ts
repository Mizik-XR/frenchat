
import { isLovableEnvironment } from '@/utils/environment/environmentDetection';

/**
 * Detects if cloud mode is forced
 * @returns true if cloud mode is forced
 */
export function isCloudModeForced(): boolean {
  // Check for forced cloud mode
  return window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true' ||
    new URLSearchParams(window.location.search).get('forceCloud') === 'true' ||
    isLovableEnvironment();
}

/**
 * Handles service mode changes
 * @param callback Function to call when the mode changes
 * @returns Cleanup function
 */
export function setupServiceModeListener(callback: () => void): () => void {
  const handleStorageChange = () => {
    callback();
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}

/**
 * Checks if local AI is allowed in the current environment
 * @returns true if local AI is allowed
 */
export function isLocalAIAllowed(): boolean {
  // Check environment variable to explicitly allow local AI
  return import.meta.env.VITE_ALLOW_LOCAL_AI === 'true' || 
         !import.meta.env.VITE_CLOUD_MODE; // In local environment, it's always allowed
}
