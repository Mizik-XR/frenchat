
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { checkLocalService } from './ai/aiServiceUtils';
import { useHuggingFace } from './useHuggingFace';
import { checkBrowserCompatibility } from './ai/analyzers/browserCompatibility';
import { testResponseTime, estimateNetworkSpeed } from './ai/analyzers/networkAnalyzer';
import { detectBrowser, getNetworkType } from './ai/analyzers/browserAnalyzer';
import { DiagnosticReport } from './diagnostics/types';
import { 
  testCloudService, 
  determineRecommendedMode, 
  collectMemoryInfo, 
  mapNetworkQuality,
  getSystemCapabilities
} from './diagnostics/diagnosticServices';

export function useDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const { localProvider, localAIUrl } = useHuggingFace();

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
      
      // Vérifier la compatibilité du navigateur
      const browserCompat = checkBrowserCompatibility();
      const { compatible, issues, capabilities } = browserCompat;
      
      // Détecter le type de réseau
      const networkType = getNetworkType();
      
      // Déterminer le mode recommandé
      const recommendationResult = await determineRecommendedMode();
      
      // Estimer les capacités système (y compris GPU)
      const systemCaps = await getSystemCapabilities();
      
      // Obtenir des informations sur la mémoire
      const memoryInfo = collectMemoryInfo();
      
      // Convertir le résultat du réseau en une échelle simple
      const networkSpeedResult = await estimateNetworkSpeed();
      const networkSpeed = mapNetworkQuality(networkSpeedResult.estimatedQuality);
      
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
          networkSpeed,
          gpuAvailable: systemCaps.hasGPU,
          gpuInfo: systemCaps.hasGPU ? "GPU détecté compatible avec l'IA" : "Pas de GPU détecté",
          systemScore: systemCaps.systemScore
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
