
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IndexingProgressState, IndexingProgress } from '@/types/indexing';

export const useIndexingProgress = (): IndexingProgressState => {
  const [state, setState] = useState<IndexingProgressState>({
    progress: 0,
    isIndexing: false,
    indexed: 0,
    total: 0,
    error: null,
    lastUpdate: Date.now(),
    indexingProgress: 0
  });

  const [indexingProgress, setIndexingProgress] = useState<IndexingProgress | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('indexing-progress')
      .on('broadcast', { event: 'progress' }, (payload) => {
        try {
          const data = payload.payload;
          if (data && typeof data === 'object') {
            const { current, total, status } = data;
            
            if (typeof current === 'number' && typeof total === 'number') {
              const progressValue = total > 0 ? Math.round((current / total) * 100) : 0;
              
              setState(prev => ({
                ...prev,
                indexed: current,
                total: total,
                progress: progressValue,
                isIndexing: status !== 'completed' && status !== 'failed',
                lastUpdate: Date.now(),
                error: status === 'failed' ? 'Échec de l\'indexation' : null,
                indexingProgress: progressValue
              }));

              // Also update the IndexingProgress object
              setIndexingProgress({
                status: status === 'failed' ? 'error' : status === 'completed' ? 'completed' : 'running',
                total: total,
                processed: current,
                error: status === 'failed' ? 'Échec de l\'indexation' : null
              });
            }
          }
        } catch (err) {
          console.error('Error processing indexing progress:', err);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const startIndexing = async (folderId: string, options: Record<string, any> = {}): Promise<string | null> => {
    try {
      console.log("Starting indexing process for folder:", folderId, "with options:", options);
      
      // Reset state
      setState(prev => ({
        ...prev,
        isIndexing: true,
        indexed: 0,
        total: 0,
        progress: 0,
        error: null,
        lastUpdate: Date.now()
      }));
      
      // Call the Supabase function to start indexing
      const { data, error } = await supabase.functions.invoke('index-google-drive', {
        body: { 
          folderId, 
          options 
        }
      });
      
      if (error) {
        console.error("Error starting indexing:", error);
        setState(prev => ({
          ...prev,
          error: error.message || "Failed to start indexing",
          isIndexing: false
        }));
        return null;
      }
      
      console.log("Indexing started successfully:", data);
      return data?.progressId || null;
      
    } catch (err) {
      console.error("Exception during indexing start:", err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error",
        isIndexing: false
      }));
      return null;
    }
  };

  return {
    ...state,
    indexingProgress: indexingProgress?.processed ? Math.round((indexingProgress.processed / indexingProgress.total) * 100) : 0,
    startIndexing
  };
};

export type { IndexingProgress };
