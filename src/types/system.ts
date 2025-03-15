
/**
 * Types pour les informations système et matérielles
 */

export interface SystemCapabilities {
  memoryInGB?: number;
  cpuCores?: number;
  cpuInfo?: string;
  hasGpu: boolean;
  gpuInfo?: string;
  diskSpaceGB?: number;
  browserInfo?: string;
  recommendedMode?: 'local' | 'cloud' | 'hybrid';
  osType?: 'windows' | 'mac' | 'linux' | 'unknown';
  osVersion?: string;
}

export interface SystemResourceStatus {
  cpu: {
    usage: number;
    cores: number;
    model?: string;
  };
  memory: {
    total: number;
    free: number;
    usage: number;
  };
  gpu?: {
    name?: string;
    available: boolean;
    memory?: number;
  };
  disk?: {
    total: number;
    free: number;
  };
}

export interface SystemTestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details: Record<string, any>;
}
