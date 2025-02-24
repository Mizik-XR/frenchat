
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface IndexingProgress {
  status: string;
  processed: number;
  total: number;
  current_folder?: string;
  depth?: number;
}

interface IndexingError {
  code: string;
  message: string;
  details?: string;
}

interface StartIndexingOptions {
  recursive?: boolean;
  maxDepth?: number;
  batchSize?: number;
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
          console.log('Indexing progress update:', payload.new);
          
          setIndexingProgress({
            status: payload.new.status,
            processed: payload.new.processed_files,
            total: payload.new.total_files,
            current_folder: payload.new.current_folder,
            depth: payload.new.depth
          });

          if (payload.new.status === 'completed') {
            toast({
              title: "Indexation terminée",
              description: "Tous les fichiers ont été indexés avec succès",
            });
          } else if (payload.new.status === 'error') {
            console.error('Indexing error:', {
              error: payload.new.error,
              folder: payload.new.current_folder,
              progress: `${payload.new.processed_files}/${payload.new.total_files}`
            });

            let errorMessage = "Une erreur est survenue pendant l'indexation";
            if (payload.new.error) {
              const error: IndexingError = JSON.parse(payload.new.error);
              switch(error.code) {
                case 'QUOTA_EXCEEDED':
                  errorMessage = "Quota Google Drive dépassé. Veuillez réessayer plus tard.";
                  break;
                case 'TOKEN_EXPIRED':
                  errorMessage = "Session Google Drive expirée. Veuillez vous reconnecter.";
                  break;
                case 'PERMISSION_DENIED':
                  errorMessage = "Accès refusé au dossier. Vérifiez vos permissions.";
                  break;
                case 'MAX_DEPTH_REACHED':
                  errorMessage = "Profondeur maximale atteinte. Certains sous-dossiers n'ont pas été indexés.";
                  break;
                default:
                  errorMessage = error.message || errorMessage;
              }
            }

            toast({
              title: "Erreur d'indexation",
              description: errorMessage,
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

  const startIndexing = async (folderId: string, options?: StartIndexingOptions) => {
    if (!user) return;
    
    try {
      console.log('Starting indexation for folder:', folderId, 'with options:', options);

      const { data, error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: { 
          userId: user.id,
          folderId,
          recursive: options?.recursive ?? true,
          maxDepth: options?.maxDepth ?? 10,
          batchSize: options?.batchSize ?? 100
        }
      });

      if (error) {
        console.error('Error starting indexation:', error);
        throw error;
      }

      console.log('Indexation started successfully:', data);

      toast({
        title: "Indexation démarrée",
        description: "L'indexation du dossier a commencé",
      });

      setIndexingProgress({
        status: 'running',
        processed: 0,
        total: 0,
        current_folder: folderId,
        depth: 0
      });

    } catch (error) {
      console.error('Error details:', {
        error,
        userId: user.id,
        folderId
      });

      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation. Vérifiez votre connexion Google Drive.",
        variant: "destructive",
      });
    }
  };

  return { indexingProgress, startIndexing };
}
