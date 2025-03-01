
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { GoogleOAuthConfig } from "@/types/google-drive";
import { getRedirectUrl } from "@/hooks/useGoogleDriveStatus";

const isGoogleOAuthConfig = (obj: unknown): obj is GoogleOAuthConfig => {
  if (!obj || typeof obj !== 'object') {
    console.error("La configuration n'est pas un objet valide");
    return false;
  }

  if (!('configured' in obj)) {
    console.error("Le statut 'configured' est manquant");
    return false;
  }

  return true;
};

export const useGoogleDrive = (user: User | null, onConfigSave: () => void) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkGoogleDriveConnection = async () => {
      if (!user) return;

      try {
        console.log('Vérification de la connexion Google Drive...');
        const { data: tokenData, error: tokenError } = await supabase
          .from('oauth_tokens')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'google')
          .maybeSingle();

        if (tokenError) {
          console.error("Erreur lors de la vérification des tokens:", tokenError);
          return;
        }

        const { data, error: configError } = await supabase
          .from('service_configurations')
          .select('config')
          .eq('service_type', 'GOOGLE_OAUTH')
          .single();

        if (configError) {
          console.error("Erreur de configuration:", configError);
          return;
        }

        const config = data?.config as unknown as GoogleOAuthConfig;
        const isValidConfig = config && isGoogleOAuthConfig(config) && config.configured;
        const hasValidToken = !!tokenData;

        setIsConnected(isValidConfig && hasValidToken);
        if (isValidConfig && hasValidToken) {
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

    try {
      setIsConnecting(true);
      const redirectUri = getRedirectUrl('auth/google/callback');
      console.log("URL de redirection OAuth configurée:", redirectUri);
      
      const { data: authData, error: authError } = await supabase.functions.invoke<{
        client_id: string;
      }>('google-oauth', {
        body: { 
          action: 'get_client_id',
          redirectUrl: redirectUri
        }
      });

      if (authError || !authData?.client_id) {
        throw new Error("Impossible de récupérer les informations d'authentification");
      }

      const scopes = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
      const redirectUrl = encodeURIComponent(redirectUri);
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${authData.client_id}&` +
        `redirect_uri=${redirectUrl}&` +
        `response_type=code&` +
        `scope=${scopes}&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log("Redirection vers:", authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth Google:', error);
      toast({
        title: "Erreur de configuration",
        description: error instanceof Error ? error.message : "Impossible d'initialiser la connexion à Google Drive",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const startFolderIndexing = async (folderId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour indexer des dossiers",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: { 
          userId: user.id,
          folderId
        }
      });

      if (error) throw error;

      toast({
        title: "Indexation démarrée",
        description: "L'indexation de votre dossier Google Drive a démarré",
      });

      return data.progressId;
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'indexation:', error);
      toast({
        title: "Erreur d'indexation",
        description: error instanceof Error ? error.message : "Impossible de démarrer l'indexation",
        variant: "destructive",
      });
    }
  };

  return {
    isConnecting,
    isConnected,
    initiateGoogleAuth,
    startFolderIndexing
  };
};
