
/**
 * Network analysis utilities for diagnostic reporting
 */

/**
 * Tests the response time of an endpoint
 * @param endpoint URL to test
 * @returns Response time in ms or null if failed
 */
export const testResponseTime = async (endpoint: string): Promise<number | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const start = performance.now();
    const response = await fetch(endpoint, { 
      method: 'HEAD',
      signal: controller.signal
    }).catch(() => null);
    const end = performance.now();
    
    clearTimeout(timeoutId);
    
    if (!response) return null;
    return Math.round(end - start);
  } catch (e) {
    console.error("Erreur lors du test de temps de réponse:", e);
    return null;
  }
};

/**
 * Estimates network speed based on a small test download
 * @returns Network speed category: 'slow', 'medium', or 'fast'
 */
export const estimateNetworkSpeed = async (): Promise<'slow' | 'medium' | 'fast'> => {
  // Simuler un petit téléchargement pour tester la vitesse
  const startTime = performance.now();
  try {
    await fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' });
    const duration = performance.now() - startTime;
    
    if (duration < 100) return 'fast';
    if (duration < 500) return 'medium';
    return 'slow';
  } catch (e) {
    console.error("Erreur lors de l'estimation de la vitesse réseau:", e);
    return 'slow';
  }
};
