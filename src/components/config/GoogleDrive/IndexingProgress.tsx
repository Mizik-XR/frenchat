import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database';

type IndexingProgress = Database['public']['Tables']['indexing_progress']['Row'];

export const IndexingProgress = ({ userId }: { userId: string }) => {
  const { data: progress, error } = useQuery({
    queryKey: ['indexing-progress', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indexing_progress')
        .select()
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as IndexingProgress | null;
    },
    refetchInterval: 1000,
    retry: 3
  });

  if (error) {
    return <div>Error loading indexing progress: {error.message}</div>;
  }

  if (!progress) {
    return <div>No indexing progress found.</div>;
  }

  return (
    <div>
      <h3>Indexing Progress</h3>
      <p>Status: {progress.status}</p>
      <p>Processed Files: {progress.processed_files}</p>
      <p>Total Files: {progress.total_files}</p>
      <p>Current Folder: {progress.current_folder}</p>
      <p>Created At: {new Date(progress.created_at).toLocaleString()}</p>
      <p>Updated At: {new Date(progress.updated_at).toLocaleString()}</p>
    </div>
  );
};
