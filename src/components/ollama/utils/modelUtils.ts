
import { ModelInfo } from "../data/modelData";
import { SystemCapabilities } from "@/types/system";

export const getFilteredModels = (
  models: ModelInfo[],
  systemCapabilities: SystemCapabilities
): ModelInfo[] => {
  // Determine system tier based on available properties
  const isHighEndSystem = systemCapabilities.hasGpu && 
                          systemCapabilities.memoryInGB && 
                          systemCapabilities.memoryInGB >= 16;
                          
  const isMidEndSystem = (!systemCapabilities.hasGpu || !isHighEndSystem) && 
                         systemCapabilities.memoryInGB && 
                         systemCapabilities.memoryInGB >= 8;
                         
  const isLowEndSystem = !isHighEndSystem && !isMidEndSystem;
  
  if (isHighEndSystem) {
    return models;
  } else if (isMidEndSystem) {
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
  if (model.requirements.gpu && !systemCapabilities.hasGpu) {
    return false;
  }
  
  // Determine low-end system based on memory
  const isLowEndSystem = !systemCapabilities.memoryInGB || 
                         systemCapabilities.memoryInGB < 8;
  
  if (
    isLowEndSystem && 
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
