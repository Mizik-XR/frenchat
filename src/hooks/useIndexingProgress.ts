
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IndexingProgress } from '@/types/config';

export const useIndexingProgress = (progressId?: string) => {
  const [progress, setProgress] = useState<IndexingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!progressId) return;

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('indexing_progress')
          .select('*')
          .eq('id', progressId)
          .single();

        if (error) throw error;

        // Conversion sécurisée en type IndexingProgress
        const progressData: IndexingProgress = {
          ...data,
          total: data.total_files || 0,
          processed: data.processed_files || 0
        };

        setProgress(progressData);
      } catch (err) {
        console.error('Erreur lors de la récupération de la progression:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    };

    const subscription = supabase
      .channel('indexing_progress_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'indexing_progress',
        filter: `id=eq.${progressId}`
      }, (payload) => {
        const updatedData = payload.new as IndexingProgress;
        setProgress(updatedData);
      })
      .subscribe();

    fetchProgress();

    return () => {
      subscription.unsubscribe();
    };
  }, [progressId]);

  return { progress, error };
};
