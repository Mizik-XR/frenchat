
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
  // Vérification de l'API de connexion avec un type sécurisé
  // @ts-ignore - Ignorer car la propriété connection n'est pas reconnue par TypeScript mais peut exister dans certains navigateurs
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    // @ts-ignore - Pour gérer les navigateurs supportant l'API NetworkInformation
    return connection.effectiveType || 'unknown';
  }
  return 'unknown';
}
