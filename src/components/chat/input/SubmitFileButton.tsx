
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
      className="gap-2 mt-2"
    >
      <Paperclip className="h-4 w-4" />
      <span className="hidden sm:inline">Joindre {filesCount > 1 ? `${filesCount} fichiers` : 'le fichier'}</span>
      <span className="sm:hidden">Joindre</span>
    </Button>
  );
}
