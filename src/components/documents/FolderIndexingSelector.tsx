
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Folder, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Folder {
  id: string;
  name: string;
  path: string;
}

export function FolderIndexingSelector() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState<{
    status: string;
    processed: number;
    total: number;
  } | null>(null);

  // Charger les dossiers Google Drive
  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;
      
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
      }
    };

    fetchFolders();
  }, [user]);

  // Suivre la progression de l'indexation
  useEffect(() => {
    if (!user || !indexingProgress) return;

    const subscription = supabase
      .from('indexing_progress')
      .on('UPDATE', payload => {
        if (payload.new.user_id === user.id) {
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
            toast({
              title: "Erreur d'indexation",
              description: payload.new.error || "Une erreur est survenue pendant l'indexation",
              variant: "destructive",
            });
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, indexingProgress]);

  const startIndexing = async () => {
    if (!selectedFolder) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: { 
          userId: user?.id,
          folderId: selectedFolder,
          batchSize: 100
        }
      });

      if (error) throw error;

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
      console.error('Erreur lors du démarrage de l\'indexation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/chat")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au chat
        </Button>
      </div>

      <div className="space-y-4">
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un dossier à indexer">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <span>Sélectionner un dossier</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>{folder.path}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={startIndexing}
          disabled={!selectedFolder || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Démarrage de l'indexation...
            </>
          ) : (
            'Indexer ce dossier'
          )}
        </Button>

        {indexingProgress && (
          <div className="space-y-2">
            <Progress 
              value={(indexingProgress.processed / indexingProgress.total) * 100} 
            />
            <Alert>
              <AlertDescription>
                {indexingProgress.processed} / {indexingProgress.total} fichiers traités
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
