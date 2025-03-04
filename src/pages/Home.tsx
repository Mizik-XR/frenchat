import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useGoogleDrivePicker } from "@/hooks/useGoogleDrivePicker";
import { useGoogleDriveFolders } from "@/hooks/useGoogleDriveFolders";
import { FolderTree } from "@/components/FolderTree";
import { GoogleDriveSync } from "@/components/GoogleDriveSync";
import { OllamaPromotion } from "@/components/ollama/OllamaPromotion";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { refreshFolders } = useGoogleDriveFolders();
  const { pickFolder } = useGoogleDrivePicker();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simuler une synchronisation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
    toast({
      title: "Synchronisation réussie!",
      description: "Vos données ont été synchronisées avec succès.",
    });
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bienvenue sur FileChat</h1>
          <p className="text-gray-500">
            Commencez à discuter avec vos fichiers en toute simplicité.
          </p>
        </div>
        
        {/* Promotion Ollama */}
        <OllamaPromotion />
        
        <Card>
          <CardHeader>
            <CardTitle>Configuration du compte</CardTitle>
            <CardDescription>
              Mettez à jour les informations de votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Clé API
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Entrez votre clé API"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Ajoutez une description"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Mettre à jour</Button>
          </CardFooter>
        </Card>

        <GoogleDriveSync />

        <Card>
          <CardHeader>
            <CardTitle>Sélection du dossier Google Drive</CardTitle>
            <CardDescription>
              Choisissez le dossier à partir duquel synchroniser les fichiers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FolderTree onFolderSelect={handleFolderSelect} />
          </CardContent>
          <CardFooter>
            <Button onClick={pickFolder}>Choisir un autre dossier</Button>
          </CardFooter>
        </Card>

        <Button onClick={() => navigate('/chat')}>Aller au Chat</Button>
      </div>
    </div>
  );
}
