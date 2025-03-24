
import { useEffect, useState  } from '@/core/reactInstance';
import { useNavigate } from "react-router-dom";
import { exchangeGoogleAuthCode } from "@/utils/googleDriveUtils";
import { validateOAuthState } from "@/utils/oauthStateManager";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Récupération des paramètres d'URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        // Gestion des erreurs retournées par Google
        if (error) {
          console.error("Erreur OAuth retournée par Google:", error);
          setStatus('error');
          setErrorMessage(`Erreur d'authentification Google: ${error}`);
          toast({
            title: "Échec de l'authentification",
            description: `Google a retourné une erreur: ${error}`,
            variant: "destructive",
          });
          return;
        }

        // Vérification des paramètres requis
        if (!code) {
          console.error("Code d'autorisation manquant dans l'URL");
          setStatus('error');
          setErrorMessage("Code d'autorisation manquant");
          toast({
            title: "Échec de l'authentification",
            description: "Code d'autorisation Google manquant",
            variant: "destructive",
          });
          return;
        }

        if (!state) {
          console.error("Paramètre state manquant dans l'URL");
          setStatus('error');
          setErrorMessage("Paramètre state manquant - possible tentative CSRF");
          toast({
            title: "Échec de l'authentification",
            description: "Paramètre de sécurité state manquant - possible tentative CSRF",
            variant: "destructive",
          });
          return;
        }

        // Validation de l'état OAuth pour prévenir les attaques CSRF
        if (!validateOAuthState('google', state)) {
          console.error("État OAuth invalide ou expiré");
          setStatus('error');
          setErrorMessage("Session d'authentification invalide ou expirée");
          toast({
            title: "Échec de l'authentification",
            description: "Session d'authentification invalide ou expirée. Veuillez réessayer.",
            variant: "destructive",
          });
          return;
        }

        // Échange du code contre des tokens via l'Edge Function sécurisée
        const userInfo = await exchangeGoogleAuthCode(code, state);
        console.log("Authentification Google réussie pour:", userInfo.email);
        
        setStatus('success');
        toast({
          title: "Authentication réussie",
          description: `Connecté à Google Drive en tant que ${userInfo.email}`,
          variant: "default",
        });
        
        // Redirection après un court délai pour laisser l'utilisateur voir le message de succès
        setTimeout(() => {
          navigate('/config?tab=google-drive', { replace: true });
        }, 1500);
      } catch (error) {
        console.error("Erreur lors du traitement du callback OAuth:", error);
        setStatus('error');
        setErrorMessage(error.message || "Une erreur inconnue est survenue");
        toast({
          title: "Échec de l'authentification",
          description: error.message || "Une erreur inconnue est survenue",
          variant: "destructive",
        });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Authentification Google Drive</h1>
          
          {status === 'loading' && (
            <div className="mt-6 flex flex-col items-center">
              <Loader2 className="mb-2 h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">
                Finalisation de l'authentification...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-6 flex flex-col items-center">
              <CheckCircle className="mb-2 h-12 w-12 text-green-500" />
              <p className="text-lg text-muted-foreground">
                Authentification réussie ! Redirection en cours...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Erreur d'authentification</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              
              <Button 
                variant="default" 
                className="w-full" 
                onClick={() => navigate('/config?tab=google-drive')}
              >
                Retour à la configuration
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
