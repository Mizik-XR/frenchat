
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  loading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, loading }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesSelected,
    multiple: false
  });

  return (
    <Card 
      {...getRootProps()} 
      className={`
        p-6 border-2 border-dashed 
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'} 
        cursor-pointer hover:border-primary transition-colors
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-muted-foreground">
          {isDragActive ? (
            <p>Déposez le fichier ici...</p>
          ) : (
            <p>
              Glissez-déposez un fichier ici, ou cliquez pour sélectionner
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
