
import { X, Paperclip } from 'lucide-react';

interface AttachedFilesListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

export function AttachedFilesList({ files, onRemoveFile, onClearAll }: AttachedFilesListProps) {
  if (files.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs shadow-sm">
          <Paperclip className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="truncate max-w-[150px] font-medium">{file.name}</span>
          <button 
            type="button" 
            onClick={() => onRemoveFile(index)}
            className="ml-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Supprimer le fichier"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button 
        type="button" 
        onClick={onClearAll}
        className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-auto underline"
      >
        Tout effacer
      </button>
    </div>
  );
}
