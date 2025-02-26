
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IndexingProgressBar } from "@/components/documents/IndexingProgressBar";
import { useIndexingProgress } from "@/hooks/useIndexingProgress";
import { Loader2 } from "lucide-react";

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConsent, setShowConsent] = useState(false);
  const [configComplete, setConfigComplete] = useState(false);
  const { indexingProgress, startIndexing } = useIndexingProgress();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      if (error) {
        console.error("Erreur d'authentification Google:", error);
        toast({
          title: "Erreur d'authentification",
          description: "L'authentification avec Google Drive a échoué",
          variant: "destructive",
        });
        navigate('/config');
        return;
      }

      if (!code) {
        console.error("Code d'autorisation manquant");
        toast({
          title: "Erreur",
          description: "Code d'autorisation manquant",
          variant: "destructive",
        });
        navigate('/config');
        return;
      }

      if (!user) {
        console.error("Utilisateur non connecté");
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour utiliser cette fonctionnalité",
          variant: "destructive",
        });
        navigate('/config');
        return;
      }

      try {
        console.log("Démarrage de l'échange du code d'autorisation...");
        const { error: functionError } = await supabase.functions.invoke(
          'google-oauth',
          {
            body: { code },
            headers: { 'x-user-id': user.id }
          }
        );

        if (functionError) {
          console.error("Erreur fonction Edge:", functionError);
          throw functionError;
        }

        console.log('Configuration Google Drive réussie');
        toast({
          title: "Succès",
          description: "Google Drive connecté avec succès",
        });
        
        setConfigComplete(true);
        setShowConsent(true);

      } catch (err) {
        console.error("Erreur lors de l'échange du code:", err);
        toast({
          title: "Erreur",
          description: "Erreur lors de la connexion à Google Drive",
          variant: "destructive",
        });
        navigate('/config');
      }
    };

    handleCallback();
  }, [searchParams, navigate, user]);

  const handleStartIndexing = async () => {
    try {
      await startIndexing("root", {
        recursive: true,
        maxDepth: 10,
        batchSize: 100
      });
      setShowConsent(false);
      toast({
        title: "Indexation démarrée",
        description: "L'indexation de votre Google Drive a démarré",
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de l'indexation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    toast({
      title: "Indexation annulée",
      description: "Vous pourrez lancer l'indexation plus tard depuis les paramètres",
    });
    navigate('/config');
  };

  if (!configComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Configuration de Google Drive en cours...
          </h2>
          <p className="text-gray-500">
            Veuillez patienter pendant que nous finalisons la configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <AlertDialog open={showConsent}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Autoriser l'indexation de Google Drive</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous autoriser l'application à scanner et indexer l'ensemble de vos documents Google Drive ? 
                Cela permettra à l'IA d'y accéder pour la recherche contextuelle.
                <br /><br />
                Cette opération peut prendre plusieurs minutes selon la taille de votre Drive.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleStartIndexing}>
                Démarrer l'indexation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {indexingProgress && indexingProgress.status !== 'idle' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Progression de l'indexation</h2>
            <IndexingProgressBar progress={indexingProgress} />
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => navigate('/config')}
              >
                Retour aux paramètres
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
