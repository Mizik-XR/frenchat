
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const REDIRECT_URI = `${window.location.origin}/auth/callback/google`;

export const useGoogleDrive = (user: User | null, onConfigSave: () => void) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchClientId = async () => {
    try {
      console.log('Récupération de la configuration Google OAuth...');
      const { data, error } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'GOOGLE_OAUTH')
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la récupération du client ID:", error);
        toast({
          title: "Erreur de configuration",
          description: "Impossible de récupérer la configuration Google Drive",
          variant: "destructive",
        });
        return;
      }

      if (data?.config && 
          typeof data.config === 'object' && 
          'client_id' in data.config && 
          typeof data.config.client_id === 'string') {
        console.log('Client ID trouvé:', data.config.client_id);
        setClientId(data.config.client_id);
      } else {
        console.log('Aucun client ID trouvé dans la configuration');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de la configuration:', err);
    }
  };

  useEffect(() => {
    fetchClientId();

    const checkGoogleDriveConnection = async () => {
      if (!user) return;

      try {
        console.log('Vérification de la connexion Google Drive...');
        const { data, error } = await supabase
          .from('oauth_tokens')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'google')
          .maybeSingle();

        setIsConnected(!!data && !error);
        console.log('État de la connexion:', !!data && !error);
        
        if (!!data && !error) {
          onConfigSave();
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de la connexion:", err);
      }
    };

    checkGoogleDriveConnection();
  }, [user, onConfigSave]);

  const initiateGoogleAuth = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité",
        variant: "destructive",
      });
      return;
    }

    if (!clientId) {
      toast({
        title: "Erreur",
        description: "La configuration Google Drive n'est pas complète",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
    const redirectUri = encodeURIComponent(REDIRECT_URI);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;
    
    console.log('Redirection vers Google OAuth:', authUrl);
    window.location.href = authUrl;
  };

  return {
    isConnecting,
    clientId,
    isConnected,
    initiateGoogleAuth,
    fetchClientId
  };
};
