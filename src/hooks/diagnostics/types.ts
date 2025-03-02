
/**
 * Types related to system diagnostics
 */

export interface DiagnosticReport {
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
    gpuAvailable?: boolean;
    gpuInfo?: string;
    systemScore?: number;
  };
  compatibility: {
    compatible: boolean;
    issues: string[];
  };
}

export interface CloudServiceTestResult {
  available: boolean; 
  responseTimeMs?: number;
  error?: string;
}

export interface RecommendedModeResult {
  recommendedMode: 'local' | 'cloud' | 'hybrid';
  reason: string;
  localAvailable: boolean;
  cloudAvailable: boolean;
  systemCapable: boolean;
  systemScore?: number;
  gpuAvailable?: boolean;
}

export interface SystemCapabilityResult {
  hasGPU: boolean;
  memoryScore: number;
  cpuScore: number;
  canRunLocalModel: boolean;
  systemScore: number;
}
