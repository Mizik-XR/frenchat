import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRedirectUrl } from '@/utils/environment/urlUtils';
import { useToast } from '@/hooks/use-toast';

export const useGoogleDrive = (user, onSuccess) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  const initiateGoogleAuth = useCallback(async () => {
    if (!user) return;
    
    setIsConnecting(true);
    try {
      // Utiliser getRedirectUrl depuis les utilitaires d'environnement
      const redirectUri = getRedirectUrl('auth/google/callback');

      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: {
          code: null,
          redirectUrl: redirectUri,
          action: 'get_client_id'
        }
      });

      if (error || !data?.client_id) {
        throw new Error("Impossible de récupérer les informations d'authentification");
      }

      // Construction de l'URL d'autorisation
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${data.client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent`;

      // Redirection de l'utilisateur vers Google pour l'authentification
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Erreur lors de l'initialisation de l'authentification Google:", error);
      toast({
        title: "Erreur d'authentification",
        description: "Impossible de démarrer l'authentification Google Drive.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [user, toast]);
  
  return {
    isConnecting,
    initiateGoogleAuth,
  };
};
