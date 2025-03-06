
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  setShowUploader: (show: boolean) => void;
}

export const FileUploader = ({
  onFilesSelected,
  setShowUploader
}: FileUploaderProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleSubmitFiles = async () => {
    if (selectedFiles.length > 0) {
      await onFilesSelected(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-700"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Paperclip className="h-10 w-10 mx-auto mb-3 text-gray-400" />
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Glissez-déposez des fichiers ici ou{" "}
        <label className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          parcourez votre ordinateur
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleFileInputChange}
          />
        </label>
      </p>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Fichiers sélectionnés:</p>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded"
              >
                <span className="text-sm truncate max-w-[200px]">
                  {file.name}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setShowUploader(false)}
          className="text-gray-700 dark:text-gray-300"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmitFiles}
          disabled={selectedFiles.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Importer {selectedFiles.length} fichier(s)
        </Button>
      </div>
    </div>
  );
};
