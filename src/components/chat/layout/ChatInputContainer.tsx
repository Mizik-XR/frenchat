
import { useState } from 'react';
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { ChartGenerator } from "../visualization/ChartGenerator";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useModelSelection } from "@/hooks/useModelSelection";
import { AttachedFilesList } from "../input/AttachedFilesList";
import { ModelSelector } from "../input/ModelSelector";
import { ContentActionsMenu } from "../input/ContentActionsMenu";
import { InputField } from "../input/InputField";
import { SubmitFileButton } from "../input/SubmitFileButton";

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
  modelSource?: 'cloud' | 'local';
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
  onFilesSelected,
  modelSource = 'cloud'
}: ChatInputContainerProps) => {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [showChartGenerator, setShowChartGenerator] = useState(false);
  
  const { 
    uploadInProgress, 
    currentFiles, 
    handleFileUpload, 
    handleProcessFiles,
    handleUploadToDrive,
    clearFiles
  } = useFileUpload(onFilesSelected);
  
  const { isGeneratingImage, handleGenerateImage } = useImageGeneration();
  const { activeModel, handleModelSelect } = useModelSelection();

  const handleGenerateImageClick = async (type: 'illustration' | 'chart') => {
    const newInput = await handleGenerateImage(input, type);
    if (newInput) {
      setInput(newInput);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleChartGenerated = (imageUrl: string) => {
    setInput(input + `\n![Graphique généré](${imageUrl})`);
    setShowChartGenerator(false);
    setCsvData(null);
  };

  const handleFilesSelected = async (files: File[]) => {
    const { csvData, shouldShowChartGenerator } = await handleFileUpload(files);
    if (csvData && shouldShowChartGenerator) {
      setCsvData(csvData);
      setShowChartGenerator(true);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    currentFiles.filter((_, i) => i !== index);
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-4 border-t flex flex-col gap-4 relative">
      <div className="flex flex-col gap-2">
        <AttachedFilesList 
          files={currentFiles}
          onRemoveFile={handleRemoveFile}
          onClearAll={clearFiles}
        />
        
        <InputField 
          input={input}
          setInput={setInput}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          hasFiles={currentFiles.length > 0}
        />
      </div>
      
      {showChartGenerator && csvData && (
        <ChartGenerator 
          data={csvData} 
          onGenerate={handleChartGenerated}
        />
      )}
      
      <div className="flex items-center justify-between">
        <ContentActionsMenu 
          isLoading={isLoading}
          uploadInProgress={uploadInProgress}
          onGenerateImage={handleGenerateImageClick}
          onToggleUploader={() => setShowUploader(!showUploader)}
          onUploadToDrive={handleUploadToDrive}
        />
        
        <ModelSelector 
          activeModel={activeModel}
          onModelSelect={handleModelSelect}
        />
      </div>

      <SubmitFileButton 
        filesCount={currentFiles.length}
        onSubmit={() => handleProcessFiles(currentFiles)}
        isLoading={uploadInProgress}
      />

      {showUploader && (
        <FileUploader
          onFilesSelected={handleFilesSelected}
          acceptedFileTypes={['.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx', '.ppt', '.pptx']}
          loading={uploadInProgress}
          description="Glissez des fichiers depuis votre ordinateur pour les ajouter à la conversation. Les fichiers seront analysés et indexés pour permettre à l'IA d'y répondre."
        />
      )}
    </form>
  );
};
