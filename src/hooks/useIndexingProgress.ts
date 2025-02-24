
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndexingProgress {
  status: 'idle' | 'running' | 'completed' | 'error';
  total: number;
  processed: number;
  current_folder?: string;
  depth?: number;
  error?: string;
}

interface IndexingOptions {
  recursive: boolean;
  maxDepth: number;
  batchSize: number;
}

export const useIndexingProgress = () => {
  const [indexingProgress, setIndexingProgress] = useState<IndexingProgress>({
    status: 'idle',
    total: 0,
    processed: 0
  });

  useEffect(() => {
    const channel = supabase
      .channel('indexing-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'indexing_progress',
        },
        (payload) => {
          console.log('Received progress update:', payload);
          if (payload.new) {
            setIndexingProgress(payload.new as IndexingProgress);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const startIndexing = async (folderId: string, options: IndexingOptions) => {
    try {
      const { error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: {
          folderId,
          options
        }
      });

      if (error) throw error;

      setIndexingProgress({
        status: 'running',
        total: 0,
        processed: 0
      });

    } catch (error) {
      console.error('Error starting indexation:', error);
      setIndexingProgress(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));
      throw error;
    }
  };

  return {
    indexingProgress,
    startIndexing
  };
};
