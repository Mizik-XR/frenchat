
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface IndexingProgress {
  status: 'idle' | 'running' | 'completed' | 'error';
  total: number;
  processed: number;
  current_folder?: string;
  last_processed_file?: string;
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
    console.log('Setting up indexing progress subscription...');
    
    // S'abonner aux changements de la table indexing_progress
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
            
            // Afficher des toasts pour les événements importants
            if (payload.new.status === 'completed') {
              toast({
                title: "Indexation terminée",
                description: `${payload.new.processed} fichiers ont été indexés avec succès.`,
              });
            } else if (payload.new.status === 'error') {
              toast({
                title: "Erreur d'indexation",
                description: payload.new.error || "Une erreur est survenue pendant l'indexation",
                variant: "destructive",
              });
            }
          }
        }
      )
      .subscribe();

    // Récupérer l'état initial
    const fetchInitialProgress = async () => {
      const { data, error } = await supabase
        .from('indexing_progress')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching initial progress:', error);
        return;
      }

      if (data) {
        setIndexingProgress(data as IndexingProgress);
      }
    };

    fetchInitialProgress();

    return () => {
      console.log('Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  const startIndexing = async (folderId: string, options: IndexingOptions) => {
    try {
      // Vérifier s'il y a déjà une indexation en cours
      const { data: existingProgress } = await supabase
        .from('indexing_progress')
        .select('*')
        .eq('status', 'running')
        .maybeSingle();

      if (existingProgress) {
        toast({
          title: "Indexation déjà en cours",
          description: "Une indexation est déjà en cours. Veuillez attendre qu'elle se termine.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: {
          folderId,
          options
        }
      });

      if (error) {
        toast({
          title: "Erreur de démarrage",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      setIndexingProgress({
        status: 'running',
        total: 0,
        processed: 0
      });

      toast({
        title: "Indexation démarrée",
        description: "L'indexation de votre dossier Google Drive a démarré.",
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
