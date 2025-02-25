
import { useCallback, useState } from 'react';
import { FileText, Upload, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useFileManager } from '@/hooks/useFileManager';
import { toast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  loading?: boolean;
  description?: string;
  acceptedFileTypes?: string[];
}

export function FileUploader({ onFilesSelected, loading, description, acceptedFileTypes }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
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

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors duration-200
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex justify-center">
          {loading ? (
            <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {loading ? 'Traitement en cours...' : 'Glissez vos fichiers ici'}
          </h3>
          <p className="text-sm text-gray-500">
            ou
          </p>
          <Button 
            variant="outline" 
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) {
                fileInput.click();
              }
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Parcourir
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
  );
}
