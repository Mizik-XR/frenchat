
/**
 * Estime les capacités du système pour déterminer s'il peut exécuter des modèles en local
 */
export async function estimateSystemCapabilities(): Promise<{
  memoryScore: number;
  cpuScore: number;
  gpuAvailable: boolean;
  recommendLocalExecution: boolean;
}> {
  // Vérification de mémoire
  const memoryScore = navigator.deviceMemory ? Math.min(navigator.deviceMemory / 4, 1) : 0.5;
  
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
