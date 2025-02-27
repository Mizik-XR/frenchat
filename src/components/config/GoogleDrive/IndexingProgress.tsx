
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface IndexingProgressProps {
  userId: string;
}

export const IndexingProgress: React.FC<IndexingProgressProps> = ({ userId }) => {
  const { data: progress, error, isLoading } = useQuery({
    queryKey: ['indexing-progress', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indexing_progress')
        .select()
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

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
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Dossier actuel : {progress.current_folder}</p>
          {progress.parent_folder && (
            <p className="text-xs">Dans : {progress.parent_folder}</p>
          )}
          <p>{progress.processed_files} fichiers traités sur {progress.total_files}</p>
          {progress.last_processed_file && (
            <p className="text-xs truncate">
              Dernier fichier : {progress.last_processed_file}
            </p>
          )}
        </div>
      )}

      {progress.status === 'error' && progress.error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          <p>Une erreur est survenue : {progress.error}</p>
        </div>
      )}
    </div>
  );
};
