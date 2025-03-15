
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { IndexingProgress as IndexingProgressType } from '@/types/google-drive';

export interface IndexingProgress {
  processed: number;
  total: number;
}

export function useIndexingProgress() {
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [progress, setProgress] = useState<IndexingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchIndexingProgress = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('indexing_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching indexing progress:', error);
          return;
        }

        if (data) {
          const { total_files, processed_files } = data;
          if (total_files > 0) {
            const percentage = Math.round((processed_files / total_files) * 100);
            setIndexingProgress(percentage);
            setProgress({
              processed: processed_files,
              total: total_files
            });
          }
        }
      } catch (error) {
        console.error('Error in useIndexingProgress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndexingProgress();

    // Set up real-time subscription for progress updates
    const subscription = supabase
      .channel('indexing_progress_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'indexing_progress',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const { total_files, processed_files } = payload.new;
        if (total_files > 0) {
          const percentage = Math.round((processed_files / total_files) * 100);
          setIndexingProgress(percentage);
          setProgress({
            processed: processed_files,
            total: total_files
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const startIndexing = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Initialize indexing progress
      const { error } = await supabase
        .from('indexing_progress')
        .upsert({
          user_id: user.id,
          total_files: 0,
          processed_files: 0,
          status: 'running',
        });

      if (error) {
        throw error;
      }

      setIndexingProgress(0);
    } catch (error) {
      console.error('Error starting indexing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    indexingProgress,
    progress,
    isLoading,
    startIndexing
  };
}
