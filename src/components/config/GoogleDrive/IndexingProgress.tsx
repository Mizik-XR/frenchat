
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { IndexingProgress as IndexingProgressType } from "@/types/google-drive";
import { toast } from "@/hooks/use-toast";

export const IndexingProgress = ({ userId }: { userId: string }) => {
  const { data: progress, error } = useQuery<IndexingProgressType>({
    queryKey: ['indexing-progress', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indexing_progress')
        .select('id, user_id, total_files, processed_files, current_folder, status, error, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data as IndexingProgressType;
    },
    refetchInterval: 1000,
    retry: 3
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erreur de suivi",
        description: "Impossible de récupérer la progression de l'indexation",
        variant: "destructive"
      });
    }
  }, [error]);

  if (!progress || progress.status === 'completed') {
    return null;
  }

  const percentage = progress.total_files > 0 
    ? Math.round((progress.processed_files / progress.total_files) * 100)
    : 0;

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Indexation en cours...</span>
          <span>{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
      
      {progress.current_folder && (
        <div className="text-sm text-muted-foreground">
          <p>Dossier actuel : {progress.current_folder}</p>
          <p>{progress.processed_files} fichiers traités sur {progress.total_files}</p>
        </div>
      )}

      {progress.status === 'error' && progress.error && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
          <p>Une erreur est survenue : {progress.error}</p>
        </div>
      )}
    </div>
  );
};
