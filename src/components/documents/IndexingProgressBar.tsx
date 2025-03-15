
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useIndexingProgress } from '@/hooks/useIndexingProgress';

export function IndexingProgressBar() {
  const { indexingProgress, isLoading } = useIndexingProgress();
  
  if (!indexingProgress || indexingProgress === 0) {
    return null;
  }
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>{`${indexingProgress}% complete`}</span>
        <span>{indexingProgress}%</span>
      </div>
      <Progress 
        value={indexingProgress} 
        className="h-2"
      />
    </div>
  );
}
