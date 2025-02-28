
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { ImageIcon, BarChart3, Upload, Paperclip, Cloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ChartGenerator } from "../visualization/ChartGenerator";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  selectedDocumentId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  mode: 'auto' | 'manual';
  model: string;
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
}

export const ChatInputContainer = ({
  input,
  setInput,
  isLoading,
  selectedDocumentId,
  onSubmit,
  mode,
  model,
  showUploader,
  setShowUploader,
  onFilesSelected
}: ChatInputContainerProps) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [showChartGenerator, setShowChartGenerator] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const { isConnected: isDriveConnected, reconnectGoogleDrive } = useGoogleDriveStatus();

  const handleGenerateImage = async (type: 'illustration' | 'chart') => {
    if (!input.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une description pour générer une image",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: input,
          type
        }
      });

      if (error) throw error;

      setInput(input + `\n![${type === 'chart' ? 'Graphique' : 'Image'}](${data.image})`);
    } catch (error: any) {
      toast({
        title: "Erreur de génération",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setCurrentFiles(files);
    
    for (const file of files) {
      if (file.type === 'text/csv') {
        const text = await file.text();
        setCsvData(text);
        setShowChartGenerator(true);
        return;
      }
    }
    
    handleProcessFiles(files);
  };
  
  const handleProcessFiles = async (files: File[]) => {
    setUploadInProgress(true);
    try {
      await onFilesSelected(files);
      setCurrentFiles([]);
      
      // Notification de succès
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
      setShowUploader(false);
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
      // Upload les fichiers vers Google Drive via la fonction Edge
      const { data, error } = await supabase.functions.invoke('upload-to-google-drive', {
        body: { files: currentFiles.map(f => ({ name: f.name, size: f.size, type: f.type })) }
      });
      
      if (error) throw error;
      
      toast({
        title: "Fichiers envoyés à Google Drive",
        description: "Vos fichiers ont été ajoutés à votre Google Drive avec succès",
      });
      
      // Processer les fichiers normalement après l'upload Drive
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

  const handleChartGenerated = (imageUrl: string) => {
    setInput(input + `\n![Graphique généré](${imageUrl})`);
    setShowChartGenerator(false);
    setCsvData(null);
  };

  const clearFiles = () => {
    setCurrentFiles([]);
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border-t flex flex-col gap-4">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Entrez votre message..."
          className="flex-1 min-h-[80px]"
        />
      </div>
      
      {currentFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
          {currentFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-1 px-2 py-1 bg-white border rounded-md text-xs">
              <Paperclip className="h-3 w-3 text-gray-500" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button 
                type="button" 
                onClick={() => {
                  setCurrentFiles(currentFiles.filter((_, i) => i !== index));
                }}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={clearFiles}
            className="text-xs text-red-500 hover:text-red-700 ml-auto"
          >
            Tout effacer
          </button>
        </div>
      )}
      
      {showChartGenerator && csvData && (
        <ChartGenerator 
          data={csvData} 
          onGenerate={handleChartGenerated}
        />
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleGenerateImage('illustration')}
            disabled={isLoading || isGeneratingImage}
            title="Générer une image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleGenerateImage('chart')}
            disabled={isLoading || isGeneratingImage}
            title="Générer un graphique"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLoading}
                title="Ajouter des fichiers"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setShowUploader(!showUploader)}>
                <Paperclip className="h-4 w-4 mr-2" />
                <span>Depuis mon appareil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleUploadToDrive} disabled={uploadInProgress}>
                <Cloud className="h-4 w-4 mr-2" />
                <span>Vers Google Drive</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          {currentFiles.length > 0 && (
            <Button 
              type="button"
              variant="outline"
              onClick={handleProcessFiles.bind(null, currentFiles)}
              disabled={uploadInProgress || currentFiles.length === 0}
              className="gap-2"
            >
              <Paperclip className="h-4 w-4" />
              <span className="hidden sm:inline">Joindre {currentFiles.length > 1 ? `${currentFiles.length} fichiers` : 'le fichier'}</span>
              <span className="sm:hidden">Joindre</span>
            </Button>
          )}
          <Button 
            type="submit"
            disabled={isLoading || (!input.trim() && currentFiles.length === 0)}
          >
            Envoyer
          </Button>
        </div>
      </div>

      {showUploader && (
        <FileUploader
          onFilesSelected={handleFileUpload}
          acceptedFileTypes={['.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx', '.ppt', '.pptx']}
          loading={uploadInProgress}
          description="Glissez des fichiers depuis votre ordinateur pour les ajouter à la conversation. Les fichiers seront analysés et indexés pour permettre à l'IA d'y répondre."
        />
      )}
    </form>
  );
};
