
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from '@/components/AuthProvider';

// Define the interface for indexing progress
export interface IndexingProgress {
  total: number;
  processed: number;
  status: string;
  current_folder?: string;
  error?: string;
  parent_folder?: string;
  depth?: number;
  last_processed_file?: string;
}

export function useIndexingProgress() {
  const [indexingProgress, setIndexingProgress] = useState<IndexingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fonction pour récupérer la progression d'indexation
  const fetchProgress = useCallback(async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('indexing_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setIndexingProgress({
          total: data.total_files || 0,
          processed: data.processed_files || 0,
          status: data.status,
          current_folder: data.current_folder,
          parent_folder: data.parent_folder,
          depth: data.depth,
          last_processed_file: data.last_processed_file,
          error: data.error
        });
        return data;
      }
      
      setIndexingProgress(null);
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
      setIndexingProgress(null);
      return null;
    }
  }, [user]);

  // Fonction pour démarrer une nouvelle indexation
  const startIndexing = useCallback(async (folderId: string, options = {}) => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour indexer des dossiers",
        variant: "destructive",
      });
      return null;
    }
    
    setIsLoading(true);
    try {
      // Appel à la fonction Edge d'indexation
      const { data, error } = await supabase.functions.invoke('index-google-drive', {
        body: { 
          folderId, 
          options,
          parent_folder: options.hasOwnProperty('parentFolder') ? options.parentFolder : null,
          depth: options.hasOwnProperty('depth') ? options.depth : 2
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Indexation démarrée",
        description: "L'indexation du dossier a commencé"
      });
      
      // Déclencher une mise à jour immédiate
      fetchProgress();
      
      return data?.progressId || null;
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'indexation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, fetchProgress]);

  // Fonction pour annuler une indexation en cours
  const cancelIndexing = useCallback(async () => {
    if (!user || !indexingProgress) return false;
    
    try {
      const { error } = await supabase
        .from('indexing_progress')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'running');
      
      if (error) throw error;
      
      toast({
        title: "Indexation annulée",
        description: "L'indexation a été arrêtée"
      });
      
      await fetchProgress();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'indexation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'indexation",
        variant: "destructive",
      });
      return false;
    }
  }, [user, indexingProgress, toast, fetchProgress]);

  // Effet pour récupérer la progression initiale
  useEffect(() => {
    fetchProgress();
    
    // Mettre en place un sondage pour les mises à jour régulières
    const interval = setInterval(fetchProgress, 5000);
    
    // Mettre en place un abonnement aux changements en temps réel
    const subscription = supabase
      .channel('indexing_progress_changes')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'indexing_progress',
        filter: user ? `user_id=eq.${user.id}` : undefined,
      }, fetchProgress)
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, [fetchProgress, user]);

  // Calculer le pourcentage de progression
  const progressPercentage = indexingProgress && indexingProgress.total > 0 
    ? Math.round((indexingProgress.processed / indexingProgress.total) * 100)
    : 0;

  return {
    indexingProgress,
    progressPercentage,
    startIndexing,
    cancelIndexing,
    isLoading,
    refreshProgress: fetchProgress,
    isIndexing: indexingProgress?.status === 'running'
  };
}
