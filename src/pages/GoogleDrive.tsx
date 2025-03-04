
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FolderTree } from '@/components/FolderTree';
import { useGoogleDrivePicker } from '@/hooks/useGoogleDrivePicker';

export default function GoogleDrive() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pickFolder } = useGoogleDrivePicker();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié avec Google Drive
    const checkAuth = async () => {
      // Simulation de vérification d'autorisation
      const mockAuthorized = Math.random() > 0.3; // 70% de chance d'être autorisé
      setIsAuthorized(mockAuthorized);
      
      if (!mockAuthorized) {
        toast({
          title: "Autorisation requise",
          description: "Veuillez autoriser l'accès à Google Drive.",
          variant: "destructive",
        });
      }
    };
    
    checkAuth();
  }, [toast]);

  const handleAuthorize = () => {
    // Simulation d'autorisation
    setTimeout(() => {
      setIsAuthorized(true);
      toast({
        title: "Autorisé",
        description: "Vous avez maintenant accès à Google Drive.",
      });
    }, 1000);
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleStartIndexing = () => {
    if (selectedFolderId) {
      navigate('/indexing', { state: { folderId: selectedFolderId } });
    } else {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un dossier à indexer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Configuration Google Drive</h1>
      
      {!isAuthorized ? (
        <Card>
          <CardHeader>
            <CardTitle>Autorisation requise</CardTitle>
            <CardDescription>
              FileChat a besoin de votre autorisation pour accéder à vos fichiers Google Drive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAuthorize}>Autoriser l'accès</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sélection du dossier</CardTitle>
              <CardDescription>
                Choisissez le dossier Google Drive à indexer pour FileChat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FolderTree onFolderSelect={handleFolderSelect} />
              <div className="flex justify-between">
                <Button onClick={() => pickFolder()}>
                  Choisir un autre dossier
                </Button>
                <Button 
                  onClick={handleStartIndexing}
                  disabled={!selectedFolderId}
                  variant="default"
                >
                  Commencer l'indexation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
