
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getGoogleRedirectUrl } from '@/hooks/useGoogleDriveStatus';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function GoogleAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      try {
        // Extraire le code d'autorisation de l'URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error("Code d'autorisation manquant dans l'URL");
        }

        console.log("Code d'autorisation reçu, échange en cours...");

        // Générer dynamiquement l'URL de redirection utilisée lors de l'autorisation
        const redirectUrl = getGoogleRedirectUrl();
        
        // Appeler la fonction Supabase Edge pour échanger le code
        const { data, error } = await supabase.functions.invoke('google-oauth', {
          body: {
            action: 'exchange_code',
            code,
            redirectUrl,
          }
        });

        if (error) {
          throw new Error(`Erreur lors de l'échange du code: ${error.message}`);
        }

        if (!data || !data.success) {
          throw new Error("Échec de l'échange du code d'autorisation");
        }

        console.log("Authentification Google réussie");
        setSuccess(true);
        
        // Redirection après un court délai pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          navigate('/config');
        }, 2000);
      } catch (err) {
        console.error("Erreur lors du callback Google:", err);
        setError(err instanceof Error ? err.message : "Une erreur inconnue s'est produite");
      } finally {
        setLoading(false);
      }
    };

    exchangeCodeForToken();
  }, [location.search, navigate]);

  if (loading) {
    return <AuthLoadingScreen message="Traitement de l'authentification Google en cours..." />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentification Google Drive</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-4">
                <Button onClick={() => navigate('/config')}>
                  Retour aux paramètres
                </Button>
              </div>
            </Alert>
          ) : (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Succès</AlertTitle>
              <AlertDescription>
                Votre compte Google Drive a été connecté avec succès. Vous allez être redirigé...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
