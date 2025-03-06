
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
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Ajout de la propriété llmStatus qui manquait
  const [llmStatus, setLlmStatus] = useState<ServiceStatus>('checking');

  const analyzeSystem = async () => {
    setIsAnalyzing(true);
    // Simuler une analyse système pour le moment
    
    setTimeout(() => {
      setCapabilities({
        ...capabilities,
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
    // Exposer la propriété llmStatus
    llmStatus
  };
}
