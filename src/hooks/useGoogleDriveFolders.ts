
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/database';

export interface Folder {
  id: string;
  name: string;
  path: string;
  metadata?: Record<string, any>;
  is_shared?: boolean;
  shared_with?: string[];
}

export function useGoogleDriveFolders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolders = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('google_drive_folders')
        .select('folder_id, name, path, metadata, is_shared, shared_with')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setFolders(data.map(folder => ({
        id: folder.folder_id,
        name: folder.name,
        path: folder.path || folder.name,
        metadata: folder.metadata as Record<string, any>,
        is_shared: folder.is_shared,
        shared_with: folder.shared_with
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dossiers Google Drive",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const refreshFolders = () => {
    fetchFolders();
  };

  return { folders, isLoading, refreshFolders };
}
