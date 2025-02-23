
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  loading?: boolean;
  description?: string;
}

export const FileUploader = ({ onFilesSelected, loading, description }: FileUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
      toast({
        title: "Fichiers sélectionnés",
        description: `${acceptedFiles.length} fichier(s) prêt(s) à être traité(s)`,
      });
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // Disable click on the dropzone area
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
      'image/bmp': ['.bmp'],
      // Archives
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'application/x-tar': ['.tar'],
      'application/gzip': ['.gz'],
      // Audio
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/aac': ['.aac'],
      // Video
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/ogg': ['.ogv'],
      'video/quicktime': ['.mov'],
      // Code
      'text/javascript': ['.js'],
      'text/typescript': ['.ts', '.tsx'],
      'text/css': ['.css'],
      'application/json': ['.json'],
      'text/xml': ['.xml'],
      // Autres
      'application/vnd.oasis.opendocument.text': ['.odt'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
      'application/vnd.oasis.opendocument.presentation': ['.odp'],
      'application/x-yaml': ['.yaml', '.yml']
    },
    multiple: true,
  });

  const supportedFormats = [
    // Documents
    'PDF', 'TXT', 'DOCX', 'DOC', 'XLS', 'XLSX', 'PPT', 'PPTX', 
    'MD', 'CSV', 'RTF', 'HTML', 'EPUB', 'ODT', 'ODS', 'ODP',
    // Images
    'JPG/JPEG', 'PNG', 'GIF', 'WEBP', 'SVG', 'TIFF', 'BMP',
    // Archives
    'ZIP', 'RAR', '7Z', 'TAR', 'GZ',
    // Audio
    'MP3', 'WAV', 'OGG', 'AAC',
    // Video
    'MP4', 'WEBM', 'OGV', 'MOV',
    // Code
    'JS', 'TS/TSX', 'CSS', 'JSON', 'XML', 'YAML/YML'
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
            ou utilisez le bouton ci-dessous
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">
              {description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Formats acceptés: {supportedFormats}
          </p>
        </div>
      </Card>

      <Button
        variant="outline"
        className="mt-4 w-full"
        disabled={loading}
        onClick={open}
      >
        {loading ? "Traitement en cours..." : "Sélectionner des fichiers"}
      </Button>
    </div>
  );
};
