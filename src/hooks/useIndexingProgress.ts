
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
      // Simulation d'un appel d'API pour démarrer l'indexation
      // Dans un environnement réel, cela appellerait une Edge Function Supabase
      
      const progressId = `progress_${Date.now()}`;
      
      // Simuler la création d'un enregistrement de progression
      await supabase.from('indexing_progress').upsert({
        id: progressId,
        user_id: user.id,
        status: 'running',
        total_files: 0,
        processed_files: 0,
        metadata: { folder_id: folderId, options }
      });
      
      toast({
        title: "Indexation démarrée",
        description: "L'indexation du dossier a commencé"
      });
      
      // Déclencher une mise à jour immédiate
      fetchProgress();
      
      return progressId;
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

  // Effet pour récupérer la progression initiale
  useEffect(() => {
    fetchProgress();
    
    // Mettre en place un sondage pour les mises à jour régulières
    const interval = setInterval(fetchProgress, 5000);
    
    return () => clearInterval(interval);
  }, [fetchProgress]);

  return {
    indexingProgress,
    startIndexing,
    isLoading,
    refreshProgress: fetchProgress
  };
}
