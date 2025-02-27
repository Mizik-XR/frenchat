
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { IndexingProgress } from '@/types/config';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface IndexingProgressBarProps {
  progress: IndexingProgress;
}

export function IndexingProgressBar({ progress }: IndexingProgressBarProps) {
  const percentage = progress && progress.total > 0 
    ? Math.min(Math.round((progress.processed / progress.total) * 100), 100)
    : 0;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'failed':
        return 'Échoué';
      case 'stopped':
        return 'Arrêté';
      default:
        return 'En attente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'stopped':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Progression de l'indexation</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      
      <Progress value={percentage} className="w-full h-2" />
      
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm text-gray-500">
          {progress.processed} sur {progress.total} fichiers traités
        </span>
        <span className={`text-sm font-medium ${getStatusColor(progress.status)}`}>
          {getStatusText(progress.status)}
          {progress.status === 'running' && (
            <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />
          )}
        </span>
      </div>
      
      {progress.status === 'running' && (
        <Alert className="mt-4">
          <AlertTitle>Indexation en cours</AlertTitle>
          <AlertDescription>
            {progress.current_folder && (
              <p className="text-sm truncate">
                Dossier actuel : {progress.current_folder}
              </p>
            )}
            {progress.last_processed_file && (
              <p className="text-sm truncate mt-1">
                Dernier fichier : {progress.last_processed_file}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {progress.error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Erreur d'indexation</AlertTitle>
          <AlertDescription>
            {progress.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
