
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EdgeFunctionResponse } from '@/integrations/supabase/client';
import { getRedirectUrl } from '@/utils/environment/urlUtils';
import { useToast } from '@/hooks/use-toast';
import { ServiceConfiguration } from '@/integrations/supabase/supabaseModels';

export const useGoogleDrive = (user, onSuccess) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  
  // Check if user is connected to Google Drive on component mount
  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('service_configurations')
          .select('status')
          .eq('user_id', user.id)
          .eq('service_type', 'google_drive')
          .single();
        
        if (!error && data && data.status === 'configured') {
          setIsConnected(true);
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess();
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion:", error);
        setIsConnected(false);
      }
    };
    
    checkConnectionStatus();
  }, [user, onSuccess]);
  
  const initiateGoogleAuth = useCallback(async () => {
    if (!user) return;
    
    setIsConnecting(true);
    try {
      // Utiliser getRedirectUrl depuis les utilitaires d'environnement
      const redirectUri = getRedirectUrl('auth/google/callback');

      const result = await supabase.functions.invoke<EdgeFunctionResponse<{ client_id: string }>>('google-oauth', {
        body: {
          code: null,
          redirectUrl: redirectUri,
          action: 'get_client_id'
        }
      });

      if (result.error || !result.data?.client_id) {
        throw new Error("Impossible de récupérer les informations d'authentification");
      }

      // Construction de l'URL d'autorisation
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${result.data.client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent`;

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
    isConnected,
    initiateGoogleAuth,
  };
};
