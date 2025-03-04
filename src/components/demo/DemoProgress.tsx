
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Loader2, Check } from "lucide-react";
import { DemoProgressProps } from './types';

export const DemoProgress: React.FC<DemoProgressProps> = ({ 
  progress, 
  currentPage, 
  complete 
}) => {
  return (
    <div className="space-y-4">
      <Progress value={progress} className="h-2 w-full" />
      
      <div className="flex items-center gap-3">
        {!complete ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <Check className="h-5 w-5 text-green-500" />
        )}
        <p>
          {!complete 
            ? `${currentPage ? `Capture de "${currentPage}"` : "Préparation..."} (${progress}%)`
            : "Génération terminée !"}
        </p>
      </div>
    </div>
  );
};
