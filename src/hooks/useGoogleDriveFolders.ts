
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Folder {
  id: string;
  name: string;
  path: string;
}

export function useGoogleDriveFolders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('google_drive_folders')
          .select('folder_id, name, path')
          .eq('user_id', user.id);

        if (error) throw error;
        
        setFolders(data.map(folder => ({
          id: folder.folder_id,
          name: folder.name,
          path: folder.path || folder.name
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
    };

    fetchFolders();
  }, [user]);

  return { folders, isLoading };
}
