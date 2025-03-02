
/**
 * Test du temps de réponse d'un service
 */
export async function testResponseTime(url: string): Promise<number> {
  try {
    const startTime = performance.now();
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    const endTime = performance.now();
    return endTime - startTime;
  } catch (error) {
    console.error(`Erreur lors du test du temps de réponse pour ${url}:`, error);
    return -1; // Indique une erreur
  }
}

/**
 * Estime la vitesse de connexion (très approximatif)
 */
export async function estimateNetworkSpeed(): Promise<{
  downloadSpeedMbps: number;
  estimatedQuality: 'poor' | 'moderate' | 'good' | 'excellent';
}> {
  try {
    // Télécharger une image pour estimer la vitesse
    const startTime = performance.now();
    const response = await fetch('https://via.placeholder.com/1000', { cache: 'no-store' });
    const blob = await response.blob();
    const endTime = performance.now();
    
    // Calcul de la vitesse approximative
    const fileSizeInBits = blob.size * 8;
    const durationInSeconds = (endTime - startTime) / 1000;
    const speedBps = fileSizeInBits / durationInSeconds;
    const speedMbps = speedBps / 1000000;
    
    // Déterminer la qualité
    let estimatedQuality: 'poor' | 'moderate' | 'good' | 'excellent';
    if (speedMbps < 1) estimatedQuality = 'poor';
    else if (speedMbps < 5) estimatedQuality = 'moderate';
    else if (speedMbps < 20) estimatedQuality = 'good';
    else estimatedQuality = 'excellent';
    
    return {
      downloadSpeedMbps: Math.round(speedMbps * 100) / 100, // Arrondi à 2 décimales
      estimatedQuality
    };
  } catch (error) {
    console.error("Erreur lors de l'estimation de la vitesse réseau:", error);
    return {
      downloadSpeedMbps: 0,
      estimatedQuality: 'poor'
    };
  }
}
