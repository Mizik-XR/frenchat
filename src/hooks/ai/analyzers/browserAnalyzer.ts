
/**
 * Détecte le navigateur utilisé
 */
export function detectBrowser(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
  
  return 'Unknown';
}

/**
 * Détermine le type de connexion (si disponible)
 */
export function getNetworkType(): string {
  if (navigator.connection) {
    // @ts-ignore - La propriété effectiveType peut ne pas être reconnue par TypeScript
    return navigator.connection.effectiveType || 'unknown';
  }
  return 'unknown';
}
