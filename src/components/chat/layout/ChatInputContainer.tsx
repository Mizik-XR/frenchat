
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { ImageIcon, BarChart3, Upload, Paperclip, Cloud, X, ArrowUp, Search, Sparkles } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

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
  const [activeModel, setActiveModel] = useState<'mixtral' | 'deepseek' | 'search'>('mixtral');
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

  const handleModelSelect = (model: 'mixtral' | 'deepseek' | 'search') => {
    setActiveModel(model);
    
    let modelName = "";
    switch(model) {
      case 'mixtral':
        modelName = "Mixtral";
        break;
      case 'deepseek':
        modelName = "DeepSeek";
        break;
      case 'search':
        modelName = "Recherche Internet";
        break;
    }
    
    toast({
      title: "Modèle sélectionné",
      description: `Vous utilisez maintenant ${modelName}`,
    });
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border-t flex flex-col gap-4 relative">
      <div className="flex flex-col gap-2">
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
        
        <div className="flex relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Entrez votre message..."
            className="flex-1 min-h-[80px] pr-12"
          />
          <button 
            type="submit"
            disabled={isLoading || (!input.trim() && currentFiles.length === 0)}
            className="absolute right-2 bottom-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {showChartGenerator && csvData && (
        <ChartGenerator 
          data={csvData} 
          onGenerate={handleChartGenerated}
        />
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleGenerateImage('illustration')}
                  disabled={isLoading || isGeneratingImage}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Générer une image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleGenerateImage('chart')}
                  disabled={isLoading || isGeneratingImage}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Générer un graphique</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
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
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Ajouter des fichiers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 rounded-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={activeModel === 'mixtral' ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleModelSelect('mixtral')}
                  className={`transition-colors ${activeModel === 'mixtral' ? 'bg-blue-100' : ''}`}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline text-xs">Mixtral</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Modèle Mixtral (HuggingFace)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={activeModel === 'deepseek' ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleModelSelect('deepseek')}
                  className={`transition-colors ${activeModel === 'deepseek' ? 'bg-purple-100' : ''}`}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline text-xs">DeepSeek</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Modèle DeepSeek</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={activeModel === 'search' ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleModelSelect('search')}
                  className={`transition-colors ${activeModel === 'search' ? 'bg-green-100' : ''}`}
                >
                  <Search className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline text-xs">Recherche</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Recherche Internet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {currentFiles.length > 0 && (
        <Button 
          type="button"
          variant="outline"
          onClick={handleProcessFiles.bind(null, currentFiles)}
          disabled={uploadInProgress || currentFiles.length === 0}
          className="gap-2 mt-2"
        >
          <Paperclip className="h-4 w-4" />
          <span className="hidden sm:inline">Joindre {currentFiles.length > 1 ? `${currentFiles.length} fichiers` : 'le fichier'}</span>
          <span className="sm:hidden">Joindre</span>
        </Button>
      )}

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

