
import { useCallback, useState } from 'react';
import { FileText, Upload, Loader2, Cloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useFileManager } from '@/hooks/useFileManager';
import { toast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  loading?: boolean;
  description?: string;
  acceptedFileTypes?: string[];
  googleDriveMode?: boolean;
}

export function FileUploader({ 
  onFilesSelected, 
  loading, 
  description, 
  acceptedFileTypes,
  googleDriveMode = false
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { validateFile, checkFileLimits } = useFileManager();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const { canUpload } = await checkFileLimits();
    
    if (!canUpload) {
      return;
    }

    const validFiles = [];
    for (const file of acceptedFiles) {
      if (await validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected, validateFile, checkFileLimits]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: acceptedFileTypes?.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>)
  });

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${googleDriveMode ? 'bg-blue-50 border-blue-300 hover:border-blue-400' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            {loading ? (
              <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            ) : googleDriveMode ? (
              <Cloud className="h-12 w-12 text-blue-500" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {loading ? 'Traitement en cours...' : googleDriveMode ? 
                'Glissez vos fichiers pour les envoyer vers Google Drive' : 
                'Glissez vos fichiers ici'}
            </h3>
            <p className="text-sm text-gray-500">
              ou
            </p>
            <Button 
              variant={googleDriveMode ? "default" : "outline"}
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) {
                  fileInput.click();
                }
              }}
              className={googleDriveMode ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {googleDriveMode ? (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  Sélectionner pour Google Drive
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Parcourir
                </>
              )}
            </Button>
            {description && (
              <p className="text-sm text-gray-500 mt-2">{description}</p>
            )}
            {acceptedFileTypes && acceptedFileTypes.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Types de fichiers acceptés : {acceptedFileTypes.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Fichiers sélectionnés ({selectedFiles.length})</h4>
            <Button variant="ghost" size="sm" onClick={clearFiles}>
              Effacer tout
            </Button>
          </div>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <li key={index} className="text-xs flex items-center p-1 bg-white rounded border">
                <FileText className="h-3 w-3 mr-2 text-gray-500" />
                <span className="truncate max-w-full">{file.name}</span>
                <span className="ml-auto text-gray-500">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
