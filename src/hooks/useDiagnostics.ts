
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { checkLocalService } from './ai/aiServiceUtils';
import { estimateSystemCapabilities } from './ai/requestAnalyzer';
import { useHuggingFace } from './useHuggingFace';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticReport {
  timestamp: string;
  aiService: {
    local: {
      available: boolean;
      endpoint: string | null;
      responseTime: number | null;
      provider: string;
    };
    cloud: {
      available: boolean;
      responseTime: number | null;
    };
    recommendedMode: 'local' | 'cloud' | 'hybrid';
  };
  system: {
    browser: string;
    capabilities: Record<string, boolean>;
    memory: {
      totalJSHeapSize?: number;
      usedJSHeapSize?: number;
      jsHeapSizeLimit?: number;
    };
    networkType?: string;
    networkSpeed?: 'slow' | 'medium' | 'fast';
  };
  compatibility: {
    compatible: boolean;
    issues: string[];
  };
}

export function useDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const { localProvider, localAIUrl } = useHuggingFace();

  // Test de temps de réponse
  const testResponseTime = async (endpoint: string): Promise<number | null> => {
    try {
      const start = performance.now();
      const response = await fetch(endpoint, { 
        method: 'HEAD',
        timeout: 2000
      }).catch(() => null);
      const end = performance.now();
      
      if (!response) return null;
      return Math.round(end - start);
    } catch (e) {
      console.error("Erreur lors du test de temps de réponse:", e);
      return null;
    }
  };

  // Test du service cloud
  const testCloudService = async (): Promise<{ available: boolean, responseTime: number | null }> => {
    try {
      const { data, error } = await supabase.functions.invoke('ping-cloud-service', { 
        body: { timestamp: new Date().toISOString() }
      });
      
      if (error) throw error;
      
      return {
        available: true,
        responseTime: data?.responseTime || null
      };
    } catch (e) {
      console.error("Erreur lors du test du service cloud:", e);
      return {
        available: false,
        responseTime: null
      };
    }
  };

  // Détection du navigateur
  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.indexOf("Firefox") > -1) {
      return "Firefox";
    } else if (userAgent.indexOf("Chrome") > -1) {
      return "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
      return "Safari";
    } else if (userAgent.indexOf("Edge") > -1) {
      return "Edge";
    } else {
      return "Navigateur inconnu";
    }
  };

  // Estimation de la vitesse réseau
  const estimateNetworkSpeed = async (): Promise<'slow' | 'medium' | 'fast'> => {
    // Simuler un petit téléchargement pour tester la vitesse
    const startTime = performance.now();
    try {
      await fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' });
      const duration = performance.now() - startTime;
      
      if (duration < 100) return 'fast';
      if (duration < 500) return 'medium';
      return 'slow';
    } catch (e) {
      console.error("Erreur lors de l'estimation de la vitesse réseau:", e);
      return 'slow';
    }
  };

  // Lancer le diagnostic complet
  const runDiagnostic = async () => {
    setIsRunning(true);
    toast({
      title: "Diagnostic en cours",
      description: "Test des services IA et analyse du système...",
    });
    
    try {
      // Vérifier le service local
      const isLocalAvailable = await checkLocalService(localAIUrl || undefined);
      const localResponseTime = isLocalAvailable ? await testResponseTime(localAIUrl || 'http://localhost:8000') : null;
      
      // Vérifier le service cloud
      const cloudService = await testCloudService();
      
      // Analyser les capacités système
      const systemCapabilities = await estimateSystemCapabilities();
      
      // Obtenir des informations sur la mémoire
      const memoryInfo: any = {};
      if (performance && 'memory' in performance) {
        const memory = (performance as any).memory;
        memoryInfo.totalJSHeapSize = memory.totalJSHeapSize;
        memoryInfo.usedJSHeapSize = memory.usedJSHeapSize;
        memoryInfo.jsHeapSizeLimit = memory.jsHeapSizeLimit;
      }
      
      // Vérifier la compatibilité du navigateur
      const { compatible, issues, capabilities } = await import('./ai/requestAnalyzer').then(
        module => module.checkBrowserCompatibility()
      );
      
      // Déterminer le mode recommandé
      let recommendedMode: 'local' | 'cloud' | 'hybrid';
      if (isLocalAvailable && systemCapabilities.recommendLocalExecution) {
        recommendedMode = 'local';
      } else if (isLocalAvailable) {
        recommendedMode = 'hybrid';
      } else {
        recommendedMode = 'cloud';
      }
      
      // Créer le rapport
      const diagnosticReport: DiagnosticReport = {
        timestamp: new Date().toISOString(),
        aiService: {
          local: {
            available: isLocalAvailable,
            endpoint: localAIUrl,
            responseTime: localResponseTime,
            provider: localProvider
          },
          cloud: cloudService,
          recommendedMode
        },
        system: {
          browser: detectBrowser(),
          capabilities,
          memory: memoryInfo,
          networkType: navigator.connection ? (navigator.connection as any).effectiveType : undefined,
          networkSpeed: await estimateNetworkSpeed()
        },
        compatibility: {
          compatible,
          issues
        }
      };
      
      setReport(diagnosticReport);
      
      // Notifier l'utilisateur
      toast({
        title: "Diagnostic terminé",
        description: `Mode recommandé: ${recommendedMode}. Consulter le rapport pour plus de détails.`,
      });
      
      // Logger le rapport dans la console pour référence
      console.log("Rapport de diagnostic:", diagnosticReport);
      
      return diagnosticReport;
    } catch (e) {
      console.error("Erreur lors du diagnostic:", e);
      toast({
        title: "Erreur de diagnostic",
        description: "Une erreur est survenue lors du diagnostic. Consultez la console pour plus de détails.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    report,
    runDiagnostic
  };
}
