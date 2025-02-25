
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IndexingProgress } from '@/hooks/useIndexingProgress';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface IndexingProgressBarProps {
  progress: IndexingProgress;
}

export function IndexingProgressBar({ progress }: IndexingProgressBarProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const percentage = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Alert className="flex items-start space-x-4">
        <div className="mt-1">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <AlertTitle>
            {progress.status === 'running' && 'Indexation en cours...'}
            {progress.status === 'completed' && 'Indexation terminée'}
            {progress.status === 'error' && 'Erreur d\'indexation'}
            {progress.status === 'idle' && 'En attente de démarrage...'}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="flex justify-between items-center mt-2">
              <span>{progress.processed} / {progress.total} fichiers traités</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            
            <Progress 
              value={percentage}
              className="h-2"
            />
            
            {progress.current_folder && (
              <div className="text-sm space-y-1 mt-2">
                <div className="font-medium">Progression détaillée :</div>
                <div className="text-gray-500">
                  Dossier actuel : {progress.current_folder}
                </div>
                {progress.last_processed_file && (
                  <div className="text-gray-500">
                    Dernier fichier traité : {progress.last_processed_file}
                  </div>
                )}
                {progress.depth !== undefined && (
                  <div className="text-gray-500">
                    Niveau de profondeur : {progress.depth}
                  </div>
                )}
              </div>
            )}

            {progress.error && (
              <div className="mt-2 text-sm text-red-500">
                {progress.error}
              </div>
            )}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
