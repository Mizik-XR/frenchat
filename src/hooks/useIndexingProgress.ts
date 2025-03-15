
import { useState, useEffect } from 'react';

export function useIndexingProgress() {
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // This hook would typically fetch the indexing progress from an API
  // For now, we'll just return the state
  useEffect(() => {
    // You could set up a subscription or polling mechanism here
    // to update the indexing progress from a real backend
    return () => {
      // Clean up any subscriptions
    };
  }, []);

  return {
    indexingProgress,
    isLoading,
    // Add methods to update progress if needed
    updateProgress: (progress: number) => setIndexingProgress(progress),
    setLoading: (loading: boolean) => setIsLoading(loading)
  };
}
