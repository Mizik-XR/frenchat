
import { ModelInfo } from "../data/modelData";
import { SystemCapabilities } from "@/hooks/useSystemCapabilities";

export const getFilteredModels = (
  models: ModelInfo[],
  systemCapabilities: SystemCapabilities
): ModelInfo[] => {
  if (systemCapabilities.isHighEndSystem) {
    return models;
  } else if (systemCapabilities.isMidEndSystem) {
    return models.filter(
      m => !m.requirements.gpu && 
      parseInt(m.requirements.memory.split(' ')[0]) <= 8
    );
  } else {
    return models.filter(
      m => !m.requirements.gpu && 
      parseInt(m.requirements.memory.split(' ')[0]) <= 4
    );
  }
};

export const filterModelsByCategory = (
  models: ModelInfo[],
  activeTab: string
): ModelInfo[] => {
  return models.filter(m => 
    activeTab === 'all' || m.category === activeTab
  );
};

export const isModelCompatible = (
  model: ModelInfo,
  systemCapabilities: SystemCapabilities
): boolean => {
  if (model.requirements.gpu && !systemCapabilities.gpuAvailable) {
    return false;
  }
  
  if (
    systemCapabilities.isLowEndSystem && 
    parseInt(model.requirements.memory.split(' ')[0]) > 4
  ) {
    return false;
  }
  
  return true;
};

export const safeButtonClick = (element: HTMLElement | null): void => {
  if (element && typeof element.click === 'function') {
    element.click();
  }
};
