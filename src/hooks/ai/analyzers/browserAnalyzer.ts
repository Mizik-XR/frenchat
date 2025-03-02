
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
  // Vérification sécurisée de l'API de connexion
  try {
    // @ts-ignore - La propriété connection n'est pas reconnue par TypeScript
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && typeof connection === 'object' && 'effectiveType' in connection) {
      // @ts-ignore - Pour gérer les navigateurs supportant l'API NetworkInformation
      return connection.effectiveType || 'unknown';
    }
  } catch (e) {
    console.error("Erreur lors de la détection du type de réseau:", e);
  }
  return 'unknown';
}
