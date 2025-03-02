
import { toast } from '@/hooks/use-toast';
import { AIServiceType } from '../types';
import { Dispatch, SetStateAction } from 'react';

export function createHybridModeActions(
  setServiceType: Dispatch<SetStateAction<AIServiceType>>,
) {
  const enableHybridMode = () => {
    setServiceType('hybrid');
    localStorage.setItem('hybridMode', 'true');
    
    toast({
      title: "Mode hybride activé",
      description: "FileChat utilise maintenant les modèles locaux et cloud ensemble",
      variant: "default"
    });
  };

  const disableHybridMode = () => {
    const defaultMode: AIServiceType = 'cloud';
    setServiceType(defaultMode);
    localStorage.removeItem('hybridMode');
    localStorage.setItem('aiServiceType', defaultMode);
    
    toast({
      title: "Mode hybride désactivé",
      description: `FileChat utilise maintenant uniquement le mode ${defaultMode}`,
      variant: "default"
    });
  };

  const isHybridModeEnabled = () => {
    return localStorage.getItem('hybridMode') === 'true' || 
           window.location.search.includes('hybrid=true');
  };

  return {
    enableHybridMode,
    disableHybridMode,
    isHybridModeEnabled
  };
}
