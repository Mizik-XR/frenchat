
import { useState, useEffect } from 'react';

interface SystemCapabilities {
  memoryGB: number | null;
  cpuCores: number | null;
  gpuAvailable: boolean;
  recommendedModels: string[];
  browserCompatible: boolean;
  isHighEndSystem: boolean;
  isMidEndSystem: boolean;
  isLowEndSystem: boolean;
}

export function useSystemCapabilities() {
  const [capabilities, setCapabilities] = useState<SystemCapabilities>({
    memoryGB: null,
    cpuCores: null,
    gpuAvailable: false,
    recommendedModels: [],
    browserCompatible: true,
    isHighEndSystem: false,
    isMidEndSystem: false,
    isLowEndSystem: true
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSystem = async () => {
    setIsAnalyzing(true);
    try {
      // Vérification de la mémoire
      let memoryEstimate = null;
      // @ts-ignore - deviceMemory n'est pas standard dans tous les navigateurs
      if (navigator.deviceMemory) {
        // @ts-ignore
        memoryEstimate = navigator.deviceMemory;
      }
      
      // Vérification des cœurs CPU
      let cpuEstimate = null;
      if (navigator.hardwareConcurrency) {
        cpuEstimate = navigator.hardwareConcurrency;
      }
      
      // Vérification GPU (via WebGL)
      const canvas = document.createElement('canvas');
      const gpuAvailable = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      
      // Détermination de la catégorie du système
      const isHighEnd = (memoryEstimate && memoryEstimate >= 8) || 
                        (cpuEstimate && cpuEstimate >= 8 && gpuAvailable);
      const isMidEnd = (memoryEstimate && memoryEstimate >= 4) || 
                       (cpuEstimate && cpuEstimate >= 4);
      const isLowEnd = !isHighEnd && !isMidEnd;
      
      // Recommandation de modèles selon la puissance
      let recommendedModels = [];
      if (isHighEnd) {
        recommendedModels = ['mistral', 'llama3', 'codellama'];
      } else if (isMidEnd) {
        recommendedModels = ['llama3-8b', 'phi-2', 'codellama-7b'];
      } else {
        recommendedModels = ['tinyllama', 'phi-2', 'gemma-2b'];
      }
      
      setCapabilities({
        memoryGB: memoryEstimate,
        cpuCores: cpuEstimate,
        gpuAvailable,
        recommendedModels,
        browserCompatible: true,
        isHighEndSystem: isHighEnd,
        isMidEndSystem: isMidEnd,
        isLowEndSystem: isLowEnd
      });
    } catch (error) {
      console.error("Erreur lors de l'analyse du système:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeSystem();
  }, []);

  return {
    capabilities,
    isAnalyzing,
    analyzeSystem
  };
}
