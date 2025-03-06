
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, FileUp, X, Paperclip } from "lucide-react";
import { Message, WebUIConfig } from "@/types/chat";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  selectedDocumentId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  mode: "auto" | "manual";
  model: string;
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
  modelSource: 'cloud' | 'local';
  replyToMessage?: Message | null;
  onClearReply?: () => void;
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
  modelSource,
  replyToMessage,
  onClearReply
}: ChatInputContainerProps) => {
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

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
      {replyToMessage && onClearReply && (
        <div className="flex items-center mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              En réponse à:
            </div>
            <div className="text-sm truncate">{replyToMessage.content}</div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClearReply}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Annuler la réponse</span>
          </Button>
        </div>
      )}

      {showUploader ? (
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
      ) : (
        <form onSubmit={handleSubmitForm} className="flex items-end gap-2">
          <div className="relative flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full p-3 text-gray-900 dark:text-gray-100 bg-transparent resize-none rounded-lg focus:outline-none min-h-[56px] max-h-[200px]"
              rows={1}
              style={{
                height: "56px",
                overflow: "auto"
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowUploader(true)}
                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="sr-only">Ajouter des fichiers</span>
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 flex items-center justify-center"
            disabled={isLoading || input.trim() === ""}
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </form>
      )}

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <div>
          <span className="font-medium">Mode:</span>{" "}
          {mode === "auto" ? "Automatique" : "Manuel"}
        </div>
        <div>
          <span className="font-medium">Modèle:</span>{" "}
          {modelSource === "local" ? "Local" : "Cloud"} - {model}
        </div>
      </div>
    </div>
  );
};
