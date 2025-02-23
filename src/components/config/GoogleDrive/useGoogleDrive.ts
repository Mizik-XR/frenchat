
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const REDIRECT_URI = `${window.location.origin}/auth/callback/google`;

export const useGoogleDrive = (user: User | null, onConfigSave: () => void) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
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

    try {
      setIsConnecting(true);
      console.log('Récupération de la configuration Google OAuth...');
      const { data: configData, error: configError } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'GOOGLE_OAUTH')
        .single();

      if (configError) {
        throw new Error("Impossible de récupérer la configuration");
      }

      if (!configData?.config?.client_id) {
        throw new Error("Client ID manquant dans la configuration");
      }

      const scopes = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
      const redirectUri = encodeURIComponent(REDIRECT_URI);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${configData.config.client_id}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;
      
      console.log('Redirection vers Google OAuth:', authUrl);
      window.location.href = authUrl;

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth Google:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la connexion à Google Drive. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  return {
    isConnecting,
    isConnected,
    initiateGoogleAuth
  };
};
