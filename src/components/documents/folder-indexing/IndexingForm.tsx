
import React, { useState } from '@/core/reactInstance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { useGoogleDriveFolders } from '@/hooks/useGoogleDriveFolders';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface IndexingFormProps {
  onStartIndexing: (folderId: string, options?: Record<string, any>) => Promise<void>;
  isLoading: boolean;
  fullDriveMode?: boolean;
}

export function IndexingForm({ 
  onStartIndexing, 
  isLoading, 
  fullDriveMode = false 
}: IndexingFormProps) {
  const { folders, isLoading: loadingFolders } = useGoogleDriveFolders();
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  
  const handleStartIndexing = async () => {
    if (!selectedFolder) return;
    
    try {
      const options = {
        recursive: includeSubfolders,
        fullDriveMode: fullDriveMode
      };
      
      await onStartIndexing(selectedFolder, options);
    } catch (error) {
      console.error("Erreur lors du démarrage de l'indexation:", error);
    }
  };
  
  if (loadingFolders) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Chargement des dossiers...</span>
      </div>
    );
  }
  
  if (folders.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Aucun dossier disponible. Veuillez d'abord connecter votre Google Drive.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <Select 
        value={selectedFolder} 
        onValueChange={setSelectedFolder}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un dossier" />
        </SelectTrigger>
        <SelectContent>
          {folders.map((folder) => (
            <SelectItem key={folder.id} value={folder.id}>
              {folder.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="includeSubfolders" 
          checked={includeSubfolders} 
          onCheckedChange={(checked) => setIncludeSubfolders(checked === true)}
          disabled={isLoading}
        />
        <Label htmlFor="includeSubfolders">
          Inclure les sous-dossiers
        </Label>
      </div>
      
      <Button 
        onClick={handleStartIndexing} 
        disabled={!selectedFolder || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Indexation en cours...
          </>
        ) : (
          fullDriveMode ? "Démarrer l'indexation complète" : "Indexer ce dossier"
        )}
      </Button>
    </div>
  );
}
