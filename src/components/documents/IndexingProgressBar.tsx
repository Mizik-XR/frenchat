
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IndexingProgress } from '@/hooks/useIndexingProgress';

interface IndexingProgressBarProps {
  progress: IndexingProgress;
}

export function IndexingProgressBar({ progress }: IndexingProgressBarProps) {
  return (
    <div className="space-y-2">
      <Progress 
        value={(progress.processed / progress.total) * 100} 
      />
      <Alert>
        <AlertDescription className="space-y-1">
          <div>{progress.processed} / {progress.total} fichiers traités</div>
          {progress.current_folder && (
            <div className="text-sm text-gray-500">
              Dossier en cours : {progress.current_folder}
              {progress.depth !== undefined && ` (niveau ${progress.depth})`}
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
