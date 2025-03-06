
import { Paperclip } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SubmitFileButtonProps {
  filesCount: number;
  onSubmit: () => void;
  isLoading: boolean;
}

export function SubmitFileButton({ filesCount, onSubmit, isLoading }: SubmitFileButtonProps) {
  if (filesCount === 0) return null;
  
  return (
    <Button 
      type="button"
      variant="outline"
      onClick={onSubmit}
      disabled={isLoading}
      className="gap-2 mt-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-900/20 transition-colors"
    >
      <Paperclip className="h-4 w-4" />
      <span className="hidden sm:inline">Joindre {filesCount > 1 ? `${filesCount} fichiers` : 'le fichier'}</span>
      <span className="sm:hidden">Joindre</span>
      {isLoading && (
        <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-500 dark:border-t-transparent"></div>
      )}
    </Button>
  );
}
