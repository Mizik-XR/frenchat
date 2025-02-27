
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IndexingProgress } from '@/types/config';

export const useIndexingProgress = (progressId?: string) => {
  const [progress, setProgress] = useState<IndexingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    if (!progressId) return;

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

  useEffect(() => {
    if (!progressId) return;

    fetchProgress();

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

    return () => {
      subscription.unsubscribe();
    };
  }, [progressId]);

  const startIndexing = async (folderId: string, options?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.functions.invoke('index-google-drive', {
        body: { folderId, options }
      });

      if (error) throw error;

      if (data?.progressId) {
        // Mise à jour du progress ID
        const newProgressId = data.progressId;
        // Rediriger vers la page avec le nouveau progressId
        return newProgressId;
      }

      return null;
    } catch (err) {
      console.error('Erreur lors du démarrage de l\'indexation:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  return { 
    progress, 
    error,
    indexingProgress: progress,
    startIndexing
  };
};

export { type IndexingProgress } from '@/types/config';
