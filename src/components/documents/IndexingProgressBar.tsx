
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { IndexingProgress } from '@/hooks/useIndexingProgress';

interface IndexingProgressBarProps {
  progress: IndexingProgress;
}

export function IndexingProgressBar({ progress }: IndexingProgressBarProps) {
  const statusIcon = () => {
    switch (progress.status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const statusText = () => {
    switch (progress.status) {
      case 'running':
        return 'Indexation en cours...';
      case 'completed':
        return 'Indexation terminée';
      case 'error':
        return `Erreur d'indexation: ${progress.error || 'Une erreur est survenue'}`;
      case 'paused':
        return 'Indexation en pause';
      default:
        return 'État inconnu';
    }
  };

  const percentComplete = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100) 
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {statusIcon()}
          <span>Progression de l'indexation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{statusText()}</span>
            <span>{percentComplete}%</span>
          </div>
          <Progress value={percentComplete} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Fichiers traités</p>
            <p className="font-medium">{progress.processed} / {progress.total}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dossier en cours</p>
            <p className="font-medium truncate">{progress.current_folder || 'N/A'}</p>
          </div>
        </div>
        
        {progress.error && (
          <div className="text-sm text-red-500 mt-2">
            {progress.error}
          </div>
        )}
      </CardContent>
      
      {progress.status === 'completed' && (
        <CardFooter>
          <Button variant="outline" size="sm" className="ml-auto">
            Voir les résultats
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
