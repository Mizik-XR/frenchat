
import { React, useEffect, useState } from '@/core/ReactInstance';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { exchangeMicrosoftAuthCode } from '@/utils/microsoftTeamsUtils';
import { validateOAuthState } from '@/utils/oauthStateManager';
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function MicrosoftAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Traitement de l\'authentification Microsoft...');
  const location = useLocation();
  const navigate = useNavigate();

  const redirectToConfig = () => {
    navigate('/config', { 
      state: { 
        section: 'microsoft-teams',
        status: status === 'success' ? 'connected' : 'failed'
      } 
    });
  };

  useEffect(() => {
    const processAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        // Vérifier les erreurs retournées par Microsoft
        if (error) {
          console.error(`Erreur OAuth Microsoft: ${error} - ${errorDescription}`);
          setStatus('error');
          setMessage(`Erreur lors de l'authentification: ${errorDescription || error}`);
          return;
        }

        // Vérifier la présence des paramètres requis
        if (!code || !state) {
          console.error('Paramètres de callback manquants');
          setStatus('error');
          setMessage('Paramètres d\'authentification incomplets.');
          return;
        }

        // Vérifier la validation de l'état pour prévenir les attaques CSRF
        const isValidState = validateOAuthState('microsoft', state);
        if (!isValidState) {
          console.error('Validation de l\'état OAuth échouée');
          setStatus('error');
          setMessage('Erreur de sécurité: validation de l\'état échouée.');
          return;
        }

        // Échanger le code contre un jeton d'accès via l'Edge Function
        const result = await exchangeMicrosoftAuthCode(code);

        if (!result.success) {
          console.error('Échec de l\'échange du code OAuth', result.error);
          setStatus('error');
          setMessage('Impossible d\'obtenir l\'accès à Microsoft Teams.');
          return;
        }

        console.log('Authentification Microsoft réussie');
        setStatus('success');
        setMessage('Connexion à Microsoft Teams réussie!');

        // Rediriger automatiquement après un court délai
        setTimeout(() => {
          redirectToConfig();
        }, 2000);
      } catch (error) {
        console.error('Erreur pendant le traitement du callback Microsoft:', error);
        setStatus('error');
        setMessage('Une erreur inattendue est survenue lors de l\'authentification.');
      }
    };

    processAuth();
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {status === 'loading' ? (
        <LoadingScreen message={message} />
      ) : (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          {status === 'success' ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-700">Authentification réussie</AlertTitle>
              <AlertDescription className="text-green-600">
                {message}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Échec de l'authentification</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6 flex justify-center">
            <Button onClick={redirectToConfig}>
              {status === 'success' ? 'Continuer la configuration' : 'Retour à la configuration'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
