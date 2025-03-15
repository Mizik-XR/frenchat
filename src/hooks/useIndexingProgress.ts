
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useIndexingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexed, setIndexed] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const channel = supabase
      .channel('indexing-progress')
      .on('broadcast', { event: 'progress' }, (payload) => {
        try {
          const data = payload.payload;
          if (data && typeof data === 'object') {
            const { current, total, status } = data;
            
            if (typeof current === 'number' && typeof total === 'number') {
              setIndexed(current);
              setTotal(total);
              setProgress(total > 0 ? Math.round((current / total) * 100) : 0);
              setIsIndexing(status !== 'completed' && status !== 'failed');
              setLastUpdate(Date.now());
              
              if (status === 'failed') {
                setError('Échec de l\'indexation');
              } else {
                setError(null);
              }
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

  return {
    progress,
    isIndexing,
    indexed,
    total,
    error,
    lastUpdate
  };
};
