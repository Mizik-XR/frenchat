
import { useState, useEffect } from 'react';

export type ServiceStatus = 'online' | 'offline' | 'checking' | 'error';

export type SystemCapabilities = {
  cuda: boolean;
  gpu: {
    available: boolean;
    name: string | null;
    memory: number | null;
  };
  ram: {
    total: number;
    available: number;
  };
  cpu: {
    cores: number;
    model: string | null;
  };
  os: string;
  diskSpace: {
    total: number;
    available: number;
  };
  network: {
    online: boolean;
    latency: number | null;
  };
  browser: {
    name: string;
    version: string;
  };
  // Propriétés nécessaires pour les composants
  gpuAvailable: boolean;
  memoryGB: number;
  cpuCores: number;
  isHighEndSystem: boolean;
  isMidEndSystem: boolean;
  isLowEndSystem: boolean;
  recommendedModels: string[];
};

export function useSystemCapabilities() {
  const [capabilities, setCapabilities] = useState<SystemCapabilities>({
    cuda: false,
    gpu: { available: false, name: null, memory: null },
    ram: { total: 0, available: 0 },
    cpu: { cores: 0, model: null },
    os: 'unknown',
    diskSpace: { total: 0, available: 0 },
    network: { online: navigator?.onLine || false, latency: null },
    browser: { name: 'unknown', version: 'unknown' },
    // Initialisation des propriétés
    gpuAvailable: false,
    memoryGB: 0,
    cpuCores: 0,
    isHighEndSystem: false,
    isMidEndSystem: false,
    isLowEndSystem: true,
    recommendedModels: ['mistral-7b', 'llama-2-7b', 'phi-2']
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmStatus, setLlmStatus] = useState<ServiceStatus>('checking');

  const analyzeSystem = async () => {
    try {
      setIsAnalyzing(true);
      // Simuler une analyse système pour le moment
      
      setTimeout(() => {
        try {
          // Vérification sécurisée des capacités WebGPU
          const hasWebGPU = typeof window !== 'undefined' && 'gpu' in navigator;
          const memoryEstimate = navigator?.deviceMemory || 16;
          const cpuCores = navigator?.hardwareConcurrency || 4;
          
          // Mise à jour des capacités du système
          setCapabilities({
            ...capabilities,
            gpuAvailable: hasWebGPU,
            memoryGB: memoryEstimate,
            cpuCores: cpuCores,
            isHighEndSystem: cpuCores > 8,
            isMidEndSystem: cpuCores >= 4 && cpuCores <= 8,
            isLowEndSystem: cpuCores < 4,
            network: { ...capabilities.network, online: navigator?.onLine || false },
          });
          
          // Mettre à jour le statut LLM en fonction de la connectivité réseau
          setLlmStatus(navigator?.onLine ? 'online' : 'offline');
        } catch (error) {
          console.error("Erreur lors de l'analyse du système:", error);
          setLlmStatus('error');
        } finally {
          setIsAnalyzing(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'initialisation de l'analyse:", error);
      setIsAnalyzing(false);
      setLlmStatus('error');
    }
  };

  useEffect(() => {
    try {
      analyzeSystem();
      
      const handleOnlineStatusChange = () => {
        setCapabilities(prev => ({
          ...prev,
          network: { ...prev.network, online: navigator?.onLine || false },
        }));
        setLlmStatus(navigator?.onLine ? 'online' : 'offline');
      };
      
      // Ajout d'écouteurs d'événements avec gestion des erreurs
      if (typeof window !== 'undefined') {
        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);
        
        return () => {
          window.removeEventListener('online', handleOnlineStatusChange);
          window.removeEventListener('offline', handleOnlineStatusChange);
        };
      }
    } catch (error) {
      console.error("Erreur lors de la configuration des écouteurs d'événements:", error);
    }
  }, []);

  return {
    capabilities,
    isAnalyzing,
    analyzeSystem,
    llmStatus
  };
}
