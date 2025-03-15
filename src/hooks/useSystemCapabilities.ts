
import { useState, useEffect } from 'react';
import { SystemCapabilities } from '@/types/system';
import { getPlatform } from '@/utils/platformUtils';

/**
 * Hook pour détecter les capacités du système
 * @returns Informations sur les capacités du système
 */
export function useSystemCapabilities() {
  const [capabilities, setCapabilities] = useState<SystemCapabilities | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const detectCapabilities = async () => {
      setIsLoading(true);
      
      try {
        // Détection du système d'exploitation
        const osType = getPlatform();
        
        // Détection de base du navigateur
        const browserInfo = getBrowserInfo();
        
        // Estimation de la mémoire disponible (si possible)
        const memoryInGB = estimateAvailableMemory();
        
        // Détection basique du GPU via WebGL
        const gpuInfo = await detectGPU();
        const hasGpu = !!gpuInfo;
        
        // Estimation des cœurs CPU
        const cpuCores = await estimateCPUCores();
        
        // Estimation du stockage disponible (si disponible)
        const diskSpaceGB = await estimateDiskSpace();
        
        // Mode recommandé en fonction des capacités détectées
        const recommendedMode = determineRecommendedMode(hasGpu, memoryInGB, cpuCores);
        
        setCapabilities({
          memoryInGB,
          cpuCores,
          hasGpu,
          gpuInfo,
          diskSpaceGB,
          browserInfo,
          recommendedMode,
          osType
        });
      } catch (error) {
        console.error("Erreur lors de la détection des capacités système:", error);
        
        // Définir des valeurs par défaut conservatrices
        setCapabilities({
          hasGpu: false,
          recommendedMode: 'cloud'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    detectCapabilities();
  }, []);
  
  return { capabilities, isLoading };
}

/**
 * Obtient des informations sur le navigateur
 */
function getBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) {
    return `Chrome ${userAgent.match(/Chrome\/(\d+)/)?.[1] || ''}`;
  } else if (userAgent.includes('Firefox')) {
    return `Firefox ${userAgent.match(/Firefox\/(\d+)/)?.[1] || ''}`;
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return `Safari ${userAgent.match(/Version\/(\d+)/)?.[1] || ''}`;
  } else if (userAgent.includes('Edge')) {
    return `Edge ${userAgent.match(/Edge\/(\d+)/)?.[1] || ''}`;
  } else {
    return 'Navigateur inconnu';
  }
}

/**
 * Estime la mémoire disponible
 */
function estimateAvailableMemory(): number | undefined {
  // Utiliser navigator.deviceMemory si disponible
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory;
  }
  
  // Sinon, renvoyer une estimation
  return undefined;
}

/**
 * Détecte les informations GPU via WebGL
 */
async function detectGPU(): Promise<string | undefined> {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return undefined;
    }
    
    // Typecasting pour accéder aux méthodes WebGL
    const webGLContext = gl as WebGLRenderingContext;
    
    const debugInfo = webGLContext.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = webGLContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return renderer;
    }
    
    return undefined;
  } catch (e) {
    console.error("Erreur lors de la détection du GPU:", e);
    return undefined;
  }
}

/**
 * Estime le nombre de cœurs CPU
 */
async function estimateCPUCores(): Promise<number | undefined> {
  if (navigator.hardwareConcurrency) {
    return navigator.hardwareConcurrency;
  }
  return undefined;
}

/**
 * Estime l'espace disque disponible
 */
async function estimateDiskSpace(): Promise<number | undefined> {
  try {
    if ('storage' in navigator && 'estimate' in (navigator as any).storage) {
      const estimate = await (navigator as any).storage.estimate();
      if (estimate && estimate.quota) {
        return Math.round(estimate.quota / (1024 * 1024 * 1024)); // En Go
      }
    }
    return undefined;
  } catch (e) {
    console.error("Erreur lors de l'estimation de l'espace disque:", e);
    return undefined;
  }
}

/**
 * Détermine le mode d'IA recommandé en fonction des capacités
 */
function determineRecommendedMode(
  hasGpu: boolean,
  memoryInGB?: number,
  cpuCores?: number
): 'local' | 'cloud' | 'hybrid' {
  // Si le GPU est disponible et qu'il y a suffisamment de mémoire, local
  if (hasGpu && memoryInGB && memoryInGB >= 8) {
    return 'local';
  }
  
  // Si beaucoup de cœurs CPU et mémoire décente, hybride
  if (cpuCores && cpuCores >= 4 && memoryInGB && memoryInGB >= 8) {
    return 'hybrid';
  }
  
  // Sinon, cloud
  return 'cloud';
}
