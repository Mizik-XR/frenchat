
import { X, Paperclip } from 'lucide-react';

interface AttachedFilesListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

export function AttachedFilesList({ files, onRemoveFile, onClearAll }: AttachedFilesListProps) {
  if (files.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-1 px-2 py-1 bg-white border rounded-md text-xs">
          <Paperclip className="h-3 w-3 text-gray-500" />
          <span className="truncate max-w-[150px]">{file.name}</span>
          <button 
            type="button" 
            onClick={() => onRemoveFile(index)}
            className="ml-1 text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button 
        type="button" 
        onClick={onClearAll}
        className="text-xs text-red-500 hover:text-red-700 ml-auto"
      >
        Tout effacer
      </button>
    </div>
  );
}
