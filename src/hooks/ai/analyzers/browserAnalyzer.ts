
/**
 * Browser analysis utilities for diagnostic reporting
 */

/**
 * Detects the user's browser based on user agent
 * @returns String identifying the browser
 */
export const detectBrowser = (): string => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf("Firefox") > -1) {
    return "Firefox";
  } else if (userAgent.indexOf("Chrome") > -1) {
    return "Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    return "Safari";
  } else if (userAgent.indexOf("Edge") > -1) {
    return "Edge";
  } else {
    return "Navigateur inconnu";
  }
};

/**
 * Gets network connection information if available
 * @returns Connection type or 'Non disponible' if not available
 */
export const getNetworkType = (): string => {
  let networkType = 'Non disponible';
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    networkType = (navigator as any).connection?.effectiveType || 'Inconnu';
  }
  return networkType;
};
