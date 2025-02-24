
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Folder, Loader2 } from 'lucide-react';
import { useGoogleDriveFolders } from '@/hooks/useGoogleDriveFolders';
import { useIndexingProgress } from '@/hooks/useIndexingProgress';
import { IndexingProgressBar } from './IndexingProgressBar';

export function FolderIndexingSelector() {
  const navigate = useNavigate();
  const { folders } = useGoogleDriveFolders();
  const { indexingProgress, startIndexing } = useIndexingProgress();
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartIndexing = async () => {
    if (!selectedFolder) return;
    setIsLoading(true);
    await startIndexing(selectedFolder);
    setIsLoading(false);
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
          onClick={handleStartIndexing}
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
          <IndexingProgressBar progress={indexingProgress} />
        )}
      </div>
    </div>
  );
}
