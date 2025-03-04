
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface UseGoogleDrivePickerResult {
  pickFolder: () => Promise<void>;
  selectedFolder: string | null;
  loading: boolean;
}

export function useGoogleDrivePicker(): UseGoogleDrivePickerResult {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const pickFolder = useCallback(async () => {
    setLoading(true);
    try {
      // Simulation de sélection d'un dossier Google Drive
      // Dans une implémentation réelle, il faudrait utiliser l'API Google Drive Picker
      setTimeout(() => {
        const mockFolderId = `folder_${Math.random().toString(36).substr(2, 9)}`;
        setSelectedFolder(mockFolderId);
        toast({
          title: "Dossier sélectionné",
          description: `Dossier ID: ${mockFolderId}`,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la sélection du dossier:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sélectionner le dossier",
        variant: "destructive",
      });
      setLoading(false);
    }
    
    return Promise.resolve();
  }, [toast]);

  return {
    pickFolder,
    selectedFolder,
    loading,
  };
}
