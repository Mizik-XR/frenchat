
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";

export function useFileUpload(onFilesSelected: (files: File[]) => Promise<void>) {
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const { isConnected: isDriveConnected, reconnectGoogleDrive } = useGoogleDriveStatus();

  const handleFileUpload = async (files: File[]) => {
    setCurrentFiles(files);
    
    for (const file of files) {
      if (file.type === 'text/csv') {
        const text = await file.text();
        return { csvData: text, shouldShowChartGenerator: true };
      }
    }
    
    await handleProcessFiles(files);
    return { csvData: null, shouldShowChartGenerator: false };
  };
  
  const handleProcessFiles = async (files: File[]) => {
    setUploadInProgress(true);
    try {
      await onFilesSelected(files);
      setCurrentFiles([]);
      
      if (files.length === 1) {
        toast({
          title: "Fichier ajouté",
          description: `${files[0].name} a été ajouté à la conversation`,
        });
      } else {
        toast({
          title: "Fichiers ajoutés",
          description: `${files.length} fichiers ont été ajoutés à la conversation`,
        });
      }
    } catch (error) {
      console.error("Erreur lors du traitement des fichiers:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter les fichiers sélectionnés",
        variant: "destructive"
      });
    } finally {
      setUploadInProgress(false);
    }
  };

  const handleUploadToDrive = async () => {
    if (!isDriveConnected) {
      const shouldConnect = window.confirm(
        "Vous devez connecter votre compte Google Drive pour utiliser cette fonctionnalité. Souhaitez-vous vous connecter maintenant?"
      );
      
      if (shouldConnect) {
        try {
          await reconnectGoogleDrive();
        } catch (error) {
          console.error("Erreur lors de la connexion à Google Drive:", error);
          toast({
            title: "Erreur de connexion",
            description: "Impossible de se connecter à Google Drive",
            variant: "destructive"
          });
        }
        return;
      } else {
        return;
      }
    }
    
    if (currentFiles.length === 0) {
      toast({
        title: "Aucun fichier",
        description: "Veuillez d'abord sélectionner des fichiers à uploader",
        variant: "destructive"
      });
      return;
    }
    
    setUploadInProgress(true);
    try {
      const { data, error } = await supabase.functions.invoke('upload-to-google-drive', {
        body: { files: currentFiles.map(f => ({ name: f.name, size: f.size, type: f.type })) }
      });
      
      if (error) throw error;
      
      toast({
        title: "Fichiers envoyés à Google Drive",
        description: "Vos fichiers ont été ajoutés à votre Google Drive avec succès",
      });
      
      await handleProcessFiles(currentFiles);
    } catch (error: any) {
      console.error("Erreur lors de l'upload vers Google Drive:", error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader les fichiers vers Google Drive",
        variant: "destructive"
      });
    } finally {
      setUploadInProgress(false);
    }
  };

  const clearFiles = () => {
    setCurrentFiles([]);
  };

  return {
    uploadInProgress,
    currentFiles,
    handleFileUpload,
    handleProcessFiles,
    handleUploadToDrive,
    clearFiles
  };
}
