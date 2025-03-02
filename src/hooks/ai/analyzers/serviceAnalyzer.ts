
import { AIServiceType } from '../types';

/**
 * Teste la disponibilité du service cloud
 */
export async function testCloudService(url = 'https://api-inference.huggingface.co'): Promise<{
  available: boolean;
  responseTimeMs?: number;
  error?: string;
}> {
  try {
    const startTime = performance.now();
    const response = await fetch(`${url}/health-check`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    const endTime = performance.now();
    
    return {
      available: true,
      responseTimeMs: Math.round(endTime - startTime)
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Détermine le mode recommandé en fonction des tests
 */
export async function determineRecommendedMode(): Promise<{
  recommendedMode: AIServiceType;
  reason: string;
  localAvailable: boolean;
  cloudAvailable: boolean;
  systemCapable: boolean;
}> {
  const cloudTest = await testCloudService();
  const cloudAvailable = cloudTest.available;
  
  // Supposons que le système est capable (pour simplifier)
  const systemCapable = true;
  
  // Vérification locale simple (essayer de se connecter au serveur local)
  let localAvailable = false;
  try {
    const localTest = await fetch('http://localhost:8000/health', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(1000) // Timeout après 1 seconde
    });
    localAvailable = localTest.ok;
  } catch (error) {
    localAvailable = false;
  }
  
  // Logique de décision
  if (localAvailable && systemCapable) {
    return {
      recommendedMode: 'local',
      reason: 'Le service local est disponible et votre système est compatible',
      localAvailable,
      cloudAvailable,
      systemCapable
    };
  } else if (cloudAvailable) {
    return {
      recommendedMode: 'cloud',
      reason: localAvailable 
        ? 'Le service cloud offre de meilleures performances' 
        : 'Le service local n\'est pas disponible',
      localAvailable,
      cloudAvailable,
      systemCapable
    };
  } else {
    return {
      recommendedMode: 'local',
      reason: 'Le service cloud n\'est pas disponible',
      localAvailable,
      cloudAvailable,
      systemCapable
    };
  }
}
