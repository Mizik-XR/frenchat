
import { useState, useEffect } from 'react';
import { detectOperatingSystem } from '@/utils/environment/environmentDetection';

export interface SystemCapabilities {
  memoryGB?: number;
  cpuCores?: number;
  gpuAvailable?: boolean;
  recommendedModels: string[];
  localAIReady: boolean;
  os: 'windows' | 'macos' | 'linux' | 'other';
}

/**
 * Hook qui détecte les capacités du système de l'utilisateur
 * pour déterminer quels modèles d'IA peuvent être exécutés localement
 */
export function useSystemCapabilities() {
  const [capabilities, setCapabilities] = useState<SystemCapabilities>({
    recommendedModels: ['mistral'], // Par défaut, recommander Mistral
    localAIReady: false,
    os: 'other'
  });
  
  useEffect(() => {
    async function detectCapabilities() {
      try {
        // Détection du système d'exploitation
        const os = detectOperatingSystem();
        
        // Détection de la mémoire disponible
        const memoryGB = detectMemory();
        
        // Détection du nombre de cœurs de processeur
        const cpuCores = detectCpuCores();
        
        // Détection de la disponibilité du GPU
        const gpuAvailable = await detectGpu();
        
        // Déterminer les modèles recommandés en fonction des ressources
        const recommendedModels = getRecommendedModels(memoryGB, cpuCores, gpuAvailable);
        
        // Déterminer si le système est prêt pour l'IA locale
        const localAIReady = determineLocalAIReadiness(memoryGB, cpuCores);
        
        setCapabilities({
          memoryGB,
          cpuCores,
          gpuAvailable,
          recommendedModels,
          localAIReady,
          os
        });
      } catch (error) {
        console.error("Erreur lors de la détection des capacités système:", error);
      }
    }
    
    detectCapabilities();
  }, []);
  
  return { capabilities };
}

/**
 * Détecte la mémoire disponible sur le système
 */
function detectMemory(): number | undefined {
  try {
    if (navigator.deviceMemory) {
      // API DeviceMemory est disponible (Chrome)
      return navigator.deviceMemory;
    }
    
    // Estimation approximative basée sur les limites de performance JavaScript
    const heapLimit = performance?.memory?.jsHeapSizeLimit;
    if (heapLimit) {
      // Convertir les octets en GB et multiplier pour obtenir une estimation
      return Math.round((heapLimit / 1073741824) * 2);
    }
    
    // Valeur par défaut si la détection échoue
    return 8;
  } catch (error) {
    console.error("Erreur lors de la détection de la mémoire:", error);
    return undefined;
  }
}

/**
 * Détecte le nombre de cœurs de processeur
 */
function detectCpuCores(): number | undefined {
  try {
    return navigator.hardwareConcurrency || undefined;
  } catch (error) {
    console.error("Erreur lors de la détection des cœurs CPU:", error);
    return undefined;
  }
}

/**
 * Détecte la disponibilité du GPU
 */
async function detectGpu(): Promise<boolean> {
  try {
    // Utiliser WebGL pour détecter la présence d'un GPU
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return false;
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return false;
    }
    
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    // Vérifier si le renderer contient des noms communs de GPU
    const gpuKeywords = ['nvidia', 'amd', 'radeon', 'intel', 'iris', 'mali', 'apple gpu'];
    const hasGpu = gpuKeywords.some(keyword => 
      renderer.toLowerCase().includes(keyword)
    );
    
    return hasGpu;
  } catch (error) {
    console.error("Erreur lors de la détection du GPU:", error);
    return false;
  }
}

/**
 * Détermine les modèles recommandés en fonction des ressources
 */
function getRecommendedModels(
  memoryGB?: number, 
  cpuCores?: number, 
  gpuAvailable?: boolean
): string[] {
  const models = [];
  
  // Configuration de base (toujours disponible)
  models.push('mistral');
  
  // Ajouter plus de modèles en fonction des ressources disponibles
  if (memoryGB && memoryGB >= 16) {
    models.push('mixtral');
  }
  
  if (cpuCores && cpuCores >= 8) {
    models.push('llama3');
  }
  
  if (gpuAvailable) {
    models.push('phi');
    
    if (memoryGB && memoryGB >= 24) {
      models.push('llama3-70b');
    }
  }
  
  // Si très peu de ressources, suggérer des modèles plus légers
  if (memoryGB && memoryGB < 8) {
    // Vider le tableau et ajouter seulement des modèles légers
    models.length = 0;
    models.push('phi-mini');
    models.push('tiny-llama');
  }
  
  return models;
}

/**
 * Détermine si le système est prêt pour l'IA locale
 */
function determineLocalAIReadiness(memoryGB?: number, cpuCores?: number): boolean {
  // Exiger un minimum de mémoire et de cœurs pour l'IA locale
  return (memoryGB !== undefined && memoryGB >= 8) && 
         (cpuCores !== undefined && cpuCores >= 4);
}
