
import { estimateSystemCapabilities } from '../ai/analyzers/systemCapabilities';
import { testResponseTime } from '../ai/analyzers/networkAnalyzer';
import { CloudServiceTestResult, RecommendedModeResult, SystemCapabilityResult } from './types';

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
  const systemCapabilities = await estimateSystemCapabilities();
  const { recommendLocalExecution, gpuAvailable, memoryScore, cpuScore } = systemCapabilities;
  
  // Score global
  const systemScore = (memoryScore + cpuScore + (gpuAvailable ? 0.8 : 0.2)) / 3;
  
  // Calculer mode recommandé en fonction des capacités
  let recommendedMode: 'local' | 'cloud' | 'hybrid' = 'cloud';
  let reason = 'Système limité, mode cloud recommandé';
  
  if (recommendLocalExecution && gpuAvailable) {
    recommendedMode = 'local';
    reason = 'GPU détecté et ressources système suffisantes pour IA locale';
  } else if (recommendLocalExecution && !gpuAvailable && systemScore > 0.6) {
    recommendedMode = 'hybrid';
    reason = 'Ressources CPU/mémoire bonnes mais pas de GPU, mode hybride recommandé';
  } else if (systemScore < 0.4) {
    recommendedMode = 'cloud';
    reason = 'Ressources système limitées, mode cloud recommandé';
  }
  
  return {
    recommendedMode,
    reason,
    localAvailable: true,
    cloudAvailable: true,
    systemCapable: recommendLocalExecution,
    systemScore,
    gpuAvailable
  };
}

/**
 * Estimates system capabilities for AI workloads
 */
export async function getSystemCapabilities(): Promise<SystemCapabilityResult> {
  const systemCaps = await estimateSystemCapabilities();
  
  return {
    hasGPU: systemCaps.gpuAvailable,
    memoryScore: systemCaps.memoryScore,
    cpuScore: systemCaps.cpuScore,
    canRunLocalModel: systemCaps.recommendLocalExecution,
    systemScore: (systemCaps.memoryScore + systemCaps.cpuScore + (systemCaps.gpuAvailable ? 0.8 : 0.2)) / 3
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
