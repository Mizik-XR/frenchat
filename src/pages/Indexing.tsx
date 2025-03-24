
import { useEffect, useState  } from '@/core/reactInstance';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Indexing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'indexing' | 'completed' | 'error'>('idle');
  const [fileCount, setFileCount] = useState(0);
  const [indexedCount, setIndexedCount] = useState(0);
  const folderId = location.state?.folderId;

  useEffect(() => {
    if (!folderId) {
      toast({
        title: "Erreur",
        description: "Aucun dossier sélectionné pour l'indexation.",
        variant: "destructive",
      });
      navigate('/google-drive');
      return;
    }

    // Simulation du démarrage de l'indexation
    const startIndexing = () => {
      setStatus('indexing');
      setProgress(0);
      
      // Générer un nombre aléatoire de fichiers à indexer
      const totalFiles = Math.floor(Math.random() * 100) + 20;
      setFileCount(totalFiles);
      
      let indexed = 0;
      const interval = setInterval(() => {
        indexed += 1;
        setIndexedCount(indexed);
        const newProgress = Math.floor((indexed / totalFiles) * 100);
        setProgress(newProgress);
        
        if (indexed >= totalFiles) {
          clearInterval(interval);
          setStatus('completed');
        }
      }, 300);
      
      return () => clearInterval(interval);
    };
    
    startIndexing();
  }, [folderId, navigate, toast]);

  const handleRetry = () => {
    setStatus('indexing');
    setProgress(0);
    // Simulation de la reprise de l'indexation
    // Code similaire à celui dans useEffect
  };

  const handleGoToChat = () => {
    navigate('/chat');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Indexation des fichiers</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {status === 'idle' && "Préparation de l'indexation..."}
            {status === 'indexing' && "Indexation en cours"}
            {status === 'completed' && "Indexation terminée"}
            {status === 'error' && "Erreur d'indexation"}
          </CardTitle>
          <CardDescription>
            {status === 'idle' && "Veuillez patienter pendant que nous préparons l'indexation de vos fichiers."}
            {status === 'indexing' && `Indexation de ${fileCount} fichiers du dossier...`}
            {status === 'completed' && `${fileCount} fichiers ont été indexés avec succès.`}
            {status === 'error' && "Une erreur s'est produite lors de l'indexation de vos fichiers."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500">
              {status === 'indexing' && `${indexedCount} sur ${fileCount} fichiers`}
            </p>
          </div>
          
          <div className="flex justify-center mt-6">
            {status === 'indexing' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Indexation en cours...</span>
              </div>
            )}
            
            {status === 'completed' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Indexation terminée avec succès!</span>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>Échec de l'indexation</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            {status === 'error' && (
              <Button onClick={handleRetry}>
                Réessayer
              </Button>
            )}
            
            {status === 'completed' && (
              <Button onClick={handleGoToChat}>
                Aller au chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
