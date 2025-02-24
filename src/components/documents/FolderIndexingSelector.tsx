
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  const [isRecursive, setIsRecursive] = useState(true);
  const [maxDepth, setMaxDepth] = useState(10);
  const [batchSize, setBatchSize] = useState(100);
  
  const handleStartIndexing = async () => {
    if (!selectedFolder) return;
    setIsLoading(true);
    try {
      await startIndexing(selectedFolder, {
        recursive: isRecursive,
        maxDepth: maxDepth,
        batchSize: batchSize
      });
    } catch (error) {
      console.error('Error starting indexation:', error);
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

      <div className="space-y-6">
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
                  <span>{folder.path || folder.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="recursive"
              checked={isRecursive}
              onCheckedChange={setIsRecursive}
            />
            <Label htmlFor="recursive">Indexation récursive des sous-dossiers</Label>
          </div>

          {isRecursive && (
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="maxDepth">Profondeur maximale</Label>
                <Input
                  id="maxDepth"
                  type="number"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  min={1}
                  max={50}
                />
                <span className="text-sm text-gray-500">
                  Niveau maximum de sous-dossiers à parcourir
                </span>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="batchSize">Taille des lots</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  min={10}
                  max={500}
                />
                <span className="text-sm text-gray-500">
                  Nombre de fichiers traités par lot (10-500)
                </span>
              </div>
            </div>
          )}
        </div>

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
