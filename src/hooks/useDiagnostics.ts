
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { checkLocalService } from './ai/aiServiceUtils';
import { estimateSystemCapabilities } from './ai/analyzers/systemCapabilities';
import { useHuggingFace } from './useHuggingFace';
import { supabase } from '@/integrations/supabase/client';
import { checkBrowserCompatibility } from './ai/analyzers/browserCompatibility';
import { testResponseTime, estimateNetworkSpeed } from './ai/analyzers/networkAnalyzer';
import { detectBrowser, getNetworkType } from './ai/analyzers/browserAnalyzer';

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

// Fonction simulée pour tester le service cloud
async function testCloudService(): Promise<{ 
  available: boolean; 
  responseTimeMs?: number;
  error?: string;
}> {
  try {
    // Simulation d'un test de service cloud
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 200));
    const endTime = performance.now();
    return {
      available: true,
      responseTimeMs: endTime - startTime
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Fonction simulée pour déterminer le mode recommandé
async function determineRecommendedMode(): Promise<{ 
  recommendedMode: 'local' | 'cloud' | 'hybrid';
  reason: string;
  localAvailable: boolean;
  cloudAvailable: boolean;
  systemCapable: boolean;
}> {
  // Logique simplifiée de détermination du mode
  const systemCapable = (await estimateSystemCapabilities()).recommendLocalExecution;
  return {
    recommendedMode: systemCapable ? 'local' : 'cloud',
    reason: systemCapable ? 'Système capable d\'exécuter l\'IA en local' : 'Système limité, mode cloud recommandé',
    localAvailable: true,
    cloudAvailable: true,
    systemCapable
  };
}

export function useDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const { localProvider, localAIUrl } = useHuggingFace();

  /**
   * Collects memory information if available in the browser
   * @returns Object with memory metrics
   */
  const collectMemoryInfo = (): Record<string, number> => {
    const memoryInfo: Record<string, number> = {};
    if (performance && 'memory' in performance) {
      const memory = (performance as any).memory;
      memoryInfo.totalJSHeapSize = memory.totalJSHeapSize;
      memoryInfo.usedJSHeapSize = memory.usedJSHeapSize;
      memoryInfo.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    }
    return memoryInfo;
  };

  /**
   * Runs a complete system diagnostic
   * @returns DiagnosticReport or undefined on error
   */
  const runDiagnostic = async () => {
    setIsRunning(true);
    toast({
      title: "Diagnostic en cours",
      description: "Test des services IA et analyse du système...",
    });
    
    try {
      // Vérifier le service local
      const localServiceResult = await checkLocalService(localAIUrl || '');
      const isLocalAvailable = localServiceResult.available;
      const localResponseTime = isLocalAvailable ? await testResponseTime(localAIUrl || 'http://localhost:8000') : null;
      
      // Vérifier le service cloud
      const cloudService = await testCloudService();
      
      // Analyser les capacités système
      const systemCapabilities = await estimateSystemCapabilities();
      
      // Obtenir des informations sur la mémoire
      const memoryInfo = collectMemoryInfo();

      // Vérifier la compatibilité du navigateur
      const browserCompat = checkBrowserCompatibility();
      const { compatible, issues, capabilities } = browserCompat;
      
      // Détecter le type de réseau
      const networkType = getNetworkType();
      
      // Déterminer le mode recommandé
      const recommendationResult = await determineRecommendedMode();
      
      // Convertir le résultat du réseau en une échelle simple
      const networkSpeedResult = await estimateNetworkSpeed();
      let networkSpeed: 'slow' | 'medium' | 'fast';
      
      if (networkSpeedResult.estimatedQuality === 'poor') {
        networkSpeed = 'slow';
      } else if (networkSpeedResult.estimatedQuality === 'moderate') {
        networkSpeed = 'medium';
      } else {
        networkSpeed = 'fast';
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
          cloud: {
            available: cloudService.available,
            responseTime: cloudService.responseTimeMs || null
          },
          recommendedMode: recommendationResult.recommendedMode
        },
        system: {
          browser: detectBrowser(),
          capabilities,
          memory: memoryInfo,
          networkType,
          networkSpeed
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
        description: `Mode recommandé: ${recommendationResult.recommendedMode}. Consulter le rapport pour plus de détails.`,
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
