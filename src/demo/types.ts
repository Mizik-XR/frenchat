
export type DemoStage = 
  | 'intro' 
  | 'auth' 
  | 'config' 
  | 'indexing' 
  | 'chat' 
  | 'conclusion';

export interface DemoContextType {
  currentStage: DemoStage;
  nextStage: () => void;
  prevStage: () => void;
  goToStage: (stage: DemoStage) => void;
  progress: number;
}
