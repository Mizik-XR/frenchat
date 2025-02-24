
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const IndexingProgress = ({ userId }: { userId: string }) => {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['indexing-progress', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indexing_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: 1000 // Rafraîchir toutes les secondes
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement de la progression...
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
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Indexation en cours...</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} />
      {progress.current_folder && (
        <p className="text-sm text-muted-foreground mt-1">
          Dossier en cours : {progress.current_folder}
        </p>
      )}
      {progress.error && (
        <p className="text-sm text-red-500 mt-1">
          Erreur : {progress.error}
        </p>
      )}
    </div>
  );
};
