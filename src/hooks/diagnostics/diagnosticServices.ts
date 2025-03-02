
import { estimateSystemCapabilities } from '../ai/analyzers/systemCapabilities';
import { testResponseTime } from '../ai/analyzers/networkAnalyzer';
import { CloudServiceTestResult, RecommendedModeResult } from './types';

/**
 * Tests the cloud service availability and response time
 */
export async function testCloudService(): Promise<CloudServiceTestResult> {
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

/**
 * Determines the recommended mode based on system capabilities
 */
export async function determineRecommendedMode(): Promise<RecommendedModeResult> {
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

/**
 * Collects memory information if available in the browser
 */
export function collectMemoryInfo(): Record<string, number> {
  const memoryInfo: Record<string, number> = {};
  if (performance && 'memory' in performance) {
    const memory = (performance as any).memory;
    memoryInfo.totalJSHeapSize = memory.totalJSHeapSize;
    memoryInfo.usedJSHeapSize = memory.usedJSHeapSize;
    memoryInfo.jsHeapSizeLimit = memory.jsHeapSizeLimit;
  }
  return memoryInfo;
}

/**
 * Maps network quality to a simple scale
 */
export function mapNetworkQuality(estimatedQuality: 'poor' | 'moderate' | 'good' | 'excellent'): 'slow' | 'medium' | 'fast' {
  if (estimatedQuality === 'poor') {
    return 'slow';
  } else if (estimatedQuality === 'moderate') {
    return 'medium';
  } else {
    return 'fast';
  }
}
