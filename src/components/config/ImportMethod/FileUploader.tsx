
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  loading?: boolean;
}

export const FileUploader = ({ onFilesSelected, loading }: FileUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // Documents
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/rtf': ['.rtf'],
      'text/html': ['.html', '.htm'],
      'application/epub+zip': ['.epub'],
      // Images
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
      'image/tiff': ['.tiff', '.tif'],
      'image/bmp': ['.bmp']
    },
    multiple: true,
  });

  const supportedFormats = [
    'PDF', 'TXT', 'DOCX', 'DOC', 'XLS', 'XLSX',
    'PPT', 'PPTX', 'MD', 'CSV', 'RTF', 'HTML', 'EPUB',
    'JPG/JPEG', 'PNG', 'GIF', 'WEBP', 'SVG', 'TIFF', 'BMP'
  ].join(', ');

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card
        {...getRootProps()}
        onDragEnter={handleDragEnter}
        className={`
          p-8 border-2 border-dashed
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200'}
          cursor-pointer hover:border-primary transition-colors
          flex flex-col items-center justify-center space-y-4
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400" />
        <div className="text-center">
          <p className="text-lg font-medium">
            {isDragActive
              ? "Déposez les fichiers ici..."
              : "Glissez-déposez vos fichiers ici"
            }
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ou cliquez pour sélectionner des fichiers
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Formats acceptés: {supportedFormats}
          </p>
        </div>
      </Card>

      <Button
        variant="outline"
        className="mt-4 w-full"
        disabled={loading}
      >
        {loading ? "Traitement en cours..." : "Sélectionner des fichiers"}
      </Button>
    </div>
  );
};
