
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { IndexingProgress } from '@/types/config';

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
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">
          {progress.processed} sur {progress.total} fichiers traités
        </span>
        <span className={`text-sm font-medium ${getStatusColor(progress.status)}`}>
          {getStatusText(progress.status)}
        </span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <div className="mt-2 text-xs text-gray-500">
        {progress.last_processed_file && (
          <p className="truncate">
            Dernier fichier: {progress.last_processed_file}
          </p>
        )}
        {progress.current_folder && (
          <p className="truncate">
            Dossier actuel: {progress.current_folder}
          </p>
        )}
        {progress.error && (
          <p className="text-red-500 mt-1">
            Erreur: {progress.error}
          </p>
        )}
      </div>
    </div>
  );
}
