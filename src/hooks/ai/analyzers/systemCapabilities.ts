
/**
 * Estime les capacités du système pour déterminer s'il peut exécuter des modèles en local
 */
export async function estimateSystemCapabilities(): Promise<{
  memoryScore: number;
  cpuScore: number;
  gpuAvailable: boolean;
  recommendLocalExecution: boolean;
}> {
  // Vérification de mémoire avec typesafe check
  let memoryScore = 0.5; // Default score if deviceMemory is not available
  try {
    // @ts-ignore - La propriété deviceMemory n'est pas standard dans Navigator
    const deviceMemory = navigator.deviceMemory;
    if (typeof deviceMemory === 'number') {
      memoryScore = Math.min(deviceMemory / 4, 1);
    }
  } catch (e) {
    console.error("Erreur lors de la vérification de la mémoire:", e);
  }
  
  // Estimation basique du CPU
  let cpuScore = 0.5;
  try {
    const start = performance.now();
    for (let i = 0; i < 1000000; i++) {
      // Opération intensive pour tester le CPU
      Math.sqrt(Math.random() * 10000);
    }
    const duration = performance.now() - start;
    cpuScore = Math.min(1, 500 / duration);
  } catch (e) {
    console.error("Erreur lors de l'estimation du CPU:", e);
  }
  
  // Vérification GPU (via WebGL)
  let gpuAvailable = false;
  try {
    const canvas = document.createElement('canvas');
    gpuAvailable = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    console.error("Erreur lors de la vérification du GPU:", e);
  }
  
  // Recommandation basée sur les scores
  const recommendLocalExecution = memoryScore > 0.7 && cpuScore > 0.6 && gpuAvailable;
  
  return {
    memoryScore,
    cpuScore,
    gpuAvailable,
    recommendLocalExecution
  };
}
