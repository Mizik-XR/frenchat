
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface IndexingProgress {
  status: string;
  processed: number;
  total: number;
}

export function useIndexingProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [indexingProgress, setIndexingProgress] = useState<IndexingProgress | null>(null);

  useEffect(() => {
    if (!user || !indexingProgress) return;

    const channel = supabase.channel('indexing-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'indexing_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setIndexingProgress({
            status: payload.new.status,
            processed: payload.new.processed_files,
            total: payload.new.total_files
          });

          if (payload.new.status === 'completed') {
            toast({
              title: "Indexation terminée",
              description: "Tous les fichiers ont été indexés avec succès",
            });
          } else if (payload.new.status === 'error') {
            toast({
              title: "Erreur d'indexation",
              description: payload.new.error || "Une erreur est survenue pendant l'indexation",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, indexingProgress]);

  const startIndexing = async (folderId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: { 
          userId: user.id,
          folderId,
          batchSize: 100
        }
      });

      if (error) throw error;

      toast({
        title: "Indexation démarrée",
        description: "L'indexation du dossier a commencé",
      });

      setIndexingProgress({
        status: 'running',
        processed: 0,
        total: 0
      });

    } catch (error) {
      console.error('Erreur lors du démarrage de l\'indexation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive",
      });
    }
  };

  return { indexingProgress, startIndexing };
}
