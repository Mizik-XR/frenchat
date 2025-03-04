
import React, { createContext, useContext, useState } from 'react';
import { DemoContextType, DemoStage } from './types';
import { DEMO_STAGES } from './constants';

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  
  const nextStage = () => {
    if (currentStageIndex < DEMO_STAGES.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  };
  
  const prevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  };
  
  const goToStage = (stage: DemoStage) => {
    const index = DEMO_STAGES.indexOf(stage);
    if (index !== -1) {
      setCurrentStageIndex(index);
    }
  };
  
  const progress = ((currentStageIndex + 1) / DEMO_STAGES.length) * 100;
  
  return (
    <DemoContext.Provider 
      value={{
        currentStage: DEMO_STAGES[currentStageIndex],
        nextStage,
        prevStage,
        goToStage,
        progress
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};
