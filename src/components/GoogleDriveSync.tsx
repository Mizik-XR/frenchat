
import { useState  } from '@/core/reactInstance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CloudUpload } from 'lucide-react';

export const GoogleDriveSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    setProgress(0);
    
    // Simuler une progression de synchronisation
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setSyncing(false);
            toast({
              title: 'Synchronisation terminée',
              description: 'Tous vos fichiers Google Drive ont été synchronisés avec succès.',
            });
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudUpload className="mr-2 h-5 w-5" />
          Synchronisation Google Drive
        </CardTitle>
        <CardDescription>
          Synchronisez vos fichiers Google Drive pour y accéder via FileChat
        </CardDescription>
      </CardHeader>
      <CardContent>
        {syncing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500">Synchronisation en cours... {progress}%</p>
          </div>
        )}
        {!syncing && (
          <p className="text-sm">
            La synchronisation permet à FileChat d'accéder et d'analyser vos documents Google Drive.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSync} 
          disabled={syncing}
        >
          {syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
        </Button>
      </CardFooter>
    </Card>
  );
};
