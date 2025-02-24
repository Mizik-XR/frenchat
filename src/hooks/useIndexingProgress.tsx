
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleDrive } from '@/components/config/GoogleDrive/useGoogleDrive';
import { Button } from '@/components/ui/button';

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
  const { initiateGoogleAuth } = useGoogleDrive(user, () => {});
  const [indexingProgress, setIndexingProgress] = useState<IndexingProgress | null>(null);

  useEffect(() => {
    if (!user || !indexingProgress) return;

    console.log('Setting up indexing progress subscription for user:', user.id);

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
          console.log('Received indexing progress update:', payload.new);
          
          setIndexingProgress({
            status: payload.new.status,
            processed: payload.new.processed_files,
            total: payload.new.total_files,
            current_folder: payload.new.current_folder,
            depth: payload.new.depth
          });

          // Gestion des différents états
          if (payload.new.status === 'completed') {
            console.log('Indexation completed successfully');
            toast({
              title: "Indexation terminée",
              description: `${payload.new.processed_files} fichiers ont été indexés avec succès`,
              variant: "default",
            });
          } else if (payload.new.status === 'error') {
            console.error('Indexing error details:', {
              error: payload.new.error,
              folder: payload.new.current_folder,
              progress: `${payload.new.processed_files}/${payload.new.total_files}`,
              lastProcessedFile: payload.new.last_processed_file
            });

            let errorMessage = "Une erreur est survenue pendant l'indexation";
            let action = null;

            if (payload.new.error) {
              const error: IndexingError = JSON.parse(payload.new.error);
              console.log('Parsed error:', error);

              switch(error.code) {
                case 'QUOTA_EXCEEDED':
                  errorMessage = "Quota Google Drive dépassé. Veuillez réessayer plus tard.";
                  break;
                case 'TOKEN_EXPIRED':
                  errorMessage = "Session Google Drive expirée. Cliquez pour vous reconnecter.";
                  action = (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={initiateGoogleAuth}
                    >
                      Reconnecter
                    </Button>
                  );
                  break;
                case 'PERMISSION_DENIED':
                  errorMessage = "Accès refusé au dossier. Vérifiez vos permissions Google Drive.";
                  break;
                case 'MAX_DEPTH_REACHED':
                  errorMessage = "Profondeur maximale atteinte. Certains sous-dossiers n'ont pas été indexés.";
                  break;
                case 'RATE_LIMIT_EXCEEDED':
                  errorMessage = "Trop de requêtes. L'indexation reprendra automatiquement dans quelques minutes.";
                  break;
                case 'NETWORK_ERROR':
                  errorMessage = "Erreur réseau. Vérifiez votre connexion internet.";
                  break;
                case 'API_ERROR':
                  errorMessage = `Erreur API Google Drive: ${error.message}`;
                  console.error('API Error details:', error.details);
                  break;
                default:
                  errorMessage = error.message || errorMessage;
                  console.error('Unknown error:', error);
              }
            }

            toast({
              title: "Erreur d'indexation",
              description: errorMessage,
              variant: "destructive",
              action: action
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up indexing progress subscription');
      supabase.removeChannel(channel);
    };
  }, [user, indexingProgress]);

  const startIndexing = async (folderId: string, options?: StartIndexingOptions) => {
    if (!user) {
      console.error('Cannot start indexing: No user logged in');
      return;
    }
    
    try {
      console.log('Starting indexation with options:', {
        folderId,
        options,
        userId: user.id
      });

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
        console.error('Error invoking batch-index-google-drive function:', error);
        throw error;
      }

      console.log('Indexation started successfully:', data);

      toast({
        title: "Indexation démarrée",
        description: "L'indexation du dossier a commencé. Vous pouvez suivre la progression ici.",
      });

      setIndexingProgress({
        status: 'running',
        processed: 0,
        total: 0,
        current_folder: folderId,
        depth: 0
      });

    } catch (error) {
      console.error('Failed to start indexation:', {
        error,
        userId: user.id,
        folderId
      });

      let errorMessage = "Impossible de démarrer l'indexation";
      if (error.message.includes('token')) {
        errorMessage = "Session Google Drive expirée. Veuillez vous reconnecter.";
        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={initiateGoogleAuth}
            >
              Reconnecter
            </Button>
          )
        });
      } else {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return { indexingProgress, startIndexing };
}
