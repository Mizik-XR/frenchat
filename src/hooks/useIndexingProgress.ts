
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface IndexingProgress {
  status: string;
  processed: number;
  total: number;
}

interface IndexingError {
  code: string;
  message: string;
  details?: string;
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
            total: payload.new.total_files
          });

          if (payload.new.status === 'completed') {
            toast({
              title: "Indexation terminée",
              description: "Tous les fichiers ont été indexés avec succès",
            });
          } else if (payload.new.status === 'error') {
            // Log détaillé de l'erreur
            console.error('Indexing error:', {
              error: payload.new.error,
              folder: payload.new.current_folder,
              progress: `${payload.new.processed_files}/${payload.new.total_files}`
            });

            // Message d'erreur plus détaillé pour l'utilisateur
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

  const startIndexing = async (folderId: string) => {
    if (!user) return;
    
    try {
      console.log('Starting indexation for folder:', folderId);

      const { data, error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: { 
          userId: user.id,
          folderId,
          batchSize: 100
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
        total: 0
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
