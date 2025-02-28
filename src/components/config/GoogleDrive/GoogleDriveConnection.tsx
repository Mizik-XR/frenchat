
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleDriveConfig } from '@/hooks/useGoogleDriveConfig';
import { GoogleDriveButton } from './GoogleDriveButton';
import { FolderCheck, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IndexingProgress } from './IndexingProgress';
import { useGoogleDriveFolders } from '@/hooks/useGoogleDriveFolders';
import { GoogleDriveAlert } from './GoogleDriveAlert';
import { GoogleDriveConnectionProps } from '@/types/google-drive';
import { AlertDescription, Alert } from '@/components/ui/alert';
import { useGoogleDriveStatus } from '@/hooks/useGoogleDriveStatus';

const GoogleDriveConnection = ({ onFolderSelect }: GoogleDriveConnectionProps) => {
  const { googleConfig, saveConfig } = useGoogleDriveConfig();
  const { isConnected } = useGoogleDriveStatus();
  const { folders, isLoading: loadingFolders } = useGoogleDriveFolders();
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // État pour tracker le progrès d'indexation
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);

  // Cas d'erreur
  const [indexingError, setIndexingError] = useState<string | null>(null);

  const handleFolderSelect = async () => {
    if (!selectedFolder) return;
    
    try {
      setShowConfirmation(false);
      setIsIndexing(true);
      setIndexProgress(0);
      
      // Ajout d'une simulation de progression pour montrer l'UI
      // Sera remplacée par le vrai tracking dans l'implémentation finale
      await onFolderSelect(selectedFolder);
      
      // Ici, on simule la mise à jour du progrès
      // Dans la vraie implémentation, cela viendrait de la fonction onFolderSelect
      const timer = setInterval(() => {
        setIndexProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      
      // Nettoyer le timer si le composant est démonté
      return () => clearInterval(timer);
    } catch (error) {
      console.error('Erreur lors de l\'indexation:', error);
      setIndexingError(error instanceof Error ? error.message : 'Une erreur est survenue');
      setIsIndexing(false);
    }
  };

  if (!isConnected) {
    return <GoogleDriveButton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-full">
            <FolderCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium">Google Drive connecté</h3>
            <p className="text-sm text-gray-500">Sélectionnez un dossier à indexer</p>
          </div>
        </div>
      </div>

      {loadingFolders ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : folders.length > 0 ? (
        <div>
          <Select 
            value={selectedFolder} 
            onValueChange={setSelectedFolder}
            disabled={isIndexing}
          >
            <SelectTrigger className="w-full">
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
          
          <div className="mt-4 flex justify-between">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
            >
              Retour
            </Button>
            
            {!showConfirmation ? (
              <Button 
                onClick={() => selectedFolder && setShowConfirmation(true)}
                disabled={!selectedFolder || isIndexing}
              >
                Indexer ce dossier
              </Button>
            ) : (
              <div className="space-y-2">
                <GoogleDriveAlert onCancel={() => setShowConfirmation(false)} onConfirm={handleFolderSelect} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Aucun dossier trouvé dans votre Google Drive. Veuillez créer un dossier avant de continuer.
          </AlertDescription>
        </Alert>
      )}

      {isIndexing && (
        <div className="mt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression de l'indexation</span>
              <span>{indexProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${indexProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500">
              {processedFiles} fichiers traités sur {totalFiles}
            </div>
          </div>
        </div>
      )}

      {indexingError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {indexingError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GoogleDriveConnection;
