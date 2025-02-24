
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
        <AlertDescription>
          {progress.processed} / {progress.total} fichiers traités
        </AlertDescription>
      </Alert>
    </div>
  );
}
