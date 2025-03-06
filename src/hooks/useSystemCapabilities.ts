
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
  // Added properties needed by components
  gpuAvailable: boolean;
  memoryGB?: number;
  cpuCores?: number;
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
    network: { online: navigator.onLine, latency: null },
    browser: { name: 'unknown', version: 'unknown' },
    // Initialize the new properties
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
    setIsAnalyzing(true);
    // Simuler une analyse système pour le moment
    
    setTimeout(() => {
      // Check WebGPU API availability instead of accessing navigator.gpu directly
      const hasWebGPU = typeof window !== 'undefined' && 'gpu' in navigator;
      
      // Update all capabilities with more realistic values
      setCapabilities({
        ...capabilities,
        gpuAvailable: hasWebGPU,
        memoryGB: 16, // Example value
        cpuCores: navigator.hardwareConcurrency || 4,
        isHighEndSystem: navigator.hardwareConcurrency > 8,
        isMidEndSystem: navigator.hardwareConcurrency >= 4 && navigator.hardwareConcurrency <= 8,
        isLowEndSystem: navigator.hardwareConcurrency < 4,
        network: { ...capabilities.network, online: navigator.onLine },
      });
      
      // Mettre à jour le statut LLM en fonction de la connectivité réseau
      setLlmStatus(navigator.onLine ? 'online' : 'offline');
      
      setIsAnalyzing(false);
    }, 1000);
  };

  useEffect(() => {
    analyzeSystem();
    
    const handleOnlineStatusChange = () => {
      setCapabilities(prev => ({
        ...prev,
        network: { ...prev.network, online: navigator.onLine },
      }));
      setLlmStatus(navigator.onLine ? 'online' : 'offline');
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  return {
    capabilities,
    isAnalyzing,
    analyzeSystem,
    llmStatus
  };
}
