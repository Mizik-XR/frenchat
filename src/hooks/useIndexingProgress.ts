
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndexingProgressState {
  progress: number;
  isIndexing: boolean;
  indexed: number;
  total: number;
  error: string | null;
  lastUpdate: number;
}

export const useIndexingProgress = () => {
  const [state, setState] = useState<IndexingProgressState>({
    progress: 0,
    isIndexing: false,
    indexed: 0,
    total: 0,
    error: null,
    lastUpdate: Date.now()
  });

  useEffect(() => {
    const channel = supabase
      .channel('indexing-progress')
      .on('broadcast', { event: 'progress' }, (payload) => {
        try {
          const data = payload.payload;
          if (data && typeof data === 'object') {
            const { current, total, status } = data;
            
            if (typeof current === 'number' && typeof total === 'number') {
              setState(prev => ({
                ...prev,
                indexed: current,
                total: total,
                progress: total > 0 ? Math.round((current / total) * 100) : 0,
                isIndexing: status !== 'completed' && status !== 'failed',
                lastUpdate: Date.now(),
                error: status === 'failed' ? 'Échec de l\'indexation' : null
              }));
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

  return state;
};
