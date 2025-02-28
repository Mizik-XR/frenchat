
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload } from "lucide-react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  setShowUploader: (show: boolean) => void;
}

export function FileUploader({ onFilesSelected, setShowUploader }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles(newFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    
    // Simuler une progression d'upload
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      // Appel de la fonction d'upload
      await onFilesSelected(files);
      
      // Upload terminé
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setShowUploader(false);
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      clearInterval(interval);
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Importer des fichiers</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowUploader(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Glissez-déposez des fichiers ici ou cliquez pour parcourir
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      {files.length > 0 && (
        <div className="mb-4">
          <p className="font-medium mb-2">Fichiers sélectionnés:</p>
          <ul className="space-y-1">
            {files.map((file, index) => (
              <li key={index} className="text-sm">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {uploading && (
        <Progress value={progress} className="mb-4" />
      )}
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setShowUploader(false)}
          disabled={uploading}
        >
          Annuler
        </Button>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          Importer
        </Button>
      </div>
    </div>
  );
}
